import web3 from "web3";
import { AbiItem } from "web3-utils";
import express, { Request, Response } from "express";
import MockToken from "./src/abis/MockToken.json";
import { MockToken as MockTokenContract } from "./types/web3-v1-contracts/MockToken";

const app = express();
app.use(express.urlencoded());
app.use(express.json());

// Infura HttpProvider Endpoint
const web3js = new web3(
  new web3.providers.WebsocketProvider("ws://localhost:8545")
);
interface MockTokenRequest {
  myAddress: string;
  toAddress: string;
  amount: string;
}

// contract abi is the array that you can get from the ethereum wallet or etherscan
const contractABI = MockToken.abi as AbiItem[];
const contractAddress = MockToken.networks[5777].address;
// creating contract object
const contract = new web3js.eth.Contract(contractABI, contractAddress);
const mockTokenContract = contract as any as MockTokenContract;

/**
 * Get accounts
 */
app.get("/accounts", async function (req: Request, res: Response) {
  res.json({
    data: {
      accounts: await web3js.eth.getAccounts(),
    },
  });
});

/**
 * Get past transactions
 */
app.get("/transactions/:id", async function (req: Request, res: Response) {
  const account: string = req.params["id"];
  const balance = await mockTokenContract.methods.balanceOf(account).call();

  console.log(balance);
  console.log(
    `account: ${account}'s balance: ${web3.utils.fromWei(balance, "ether")}`
  );
  const transactions = await contract.getPastEvents("Transfer", {
    fromBlock: 0,
    toBlock: "latest",
    filter: {
      from: account,
    },
  });

  res.json({
    message: `account: ${account}'s list of transcations: ${transactions.length}`,
    data: transactions.map((event) => event.returnValues),
    balance: web3.utils.fromWei(balance.toString(), "ether"),
  });
});

/**
 * Create Transfer
 */
app.post(
  "/transfer",
  async function (req: Request<any, any, MockTokenRequest>, res: Response) {
    const myAddress: string = req.body.myAddress;
    const toAddress: string = req.body.toAddress;
    const transferAmount = req.body.amount;

    const amount = web3js.utils.toWei(transferAmount, "ether");
    mockTokenContract.methods
      .transfer(toAddress, amount)
      .send({ from: myAddress })
      .then((transferResponse: any) => {
        console.log(transferResponse);
        res.json({
          message: `transfer successful!`,
          data: {
            amount: transferAmount,
            from: myAddress,
            to: toAddress,
          },
        });
      })
      .catch((error: any) => {
        console.trace(error);
        res.status(400).json({
          message: `transfer unsuccesful!`,
          error: error.toString(),
        });
      });
  }
);

app.listen(3000, () => console.log("Example app listening on port 3000!"));
