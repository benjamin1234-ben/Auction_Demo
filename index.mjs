import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';
import { ask, yesno, done } from '@reach-sh/stdlib/ask.mjs';
const stdlib = loadStdlib(process.env);

(async () => {
  const isCreator = await ask(
    `Are you Creator?`,
    yesno
  );
  const who = isCreator ? 'Creator' : 'Bidder';

  console.log(`Starting the Auction as ${who}`);

  let acc = null;
  const createAcc = await ask(
    `Would you like to create an account? (only possible on devnet)`,
    yesno
  );
  if (createAcc) {
    acc = await stdlib.newTestAccount(stdlib.parseCurrency(1000));
  } else {
    const secret = await ask(
      `What is your account secret?`,
      (x => x)
    );
    acc = await stdlib.newAccountFromSecret(secret);
  }

  let ctc = null;
  const deployCtc = await ask(
    `Do you want to deploy the contract? (y/n)`,
    yesno
  );
  if (deployCtc) {
    ctc = acc.deploy(backend);
    ctc.getInfo().then((info) => {
      console.log(`The contract is deployed as = ${JSON.stringify(info)}`); });
  } else {
    const info = await ask(
      `Please paste the contract information:`,
      JSON.parse
    );
    ctc = acc.attach(backend, info);
  }

  const fmt = (x) => stdlib.formatCurrency(x, 4);
  const getBalance = async () => fmt(await stdlib.balanceOf(acc));

  const before = await getBalance();
  console.log(`Your balance is ${before}`);

  interact.informTimeout = () => {
    console.log(`There was a timeout.`);
    process.exit(1);
  };

  if (isCreator) {
    const id = await ask(
      `What is the name of the auction Item?`,
      (x => x)
    );
    interact.getId = () => return id;
    const startingBid = await ask(
      'What is the starting Bid for your auction?',
      (x => x)
    );
    const timeout = await ask(
      'What is the duration of your auction?',
      (x => x)
    );
    interact.getAuctionProps = () => return {startingBid, timeout};
    const auctionItem = await ask(
      'What information are you going to auction?',
      (x => x)
    );
    interact.getAuctionItem = () => return item;
  } else {
    interact.showOwner = async (name, owner) => {
      console.log(`The name of the auction Item is ${name}.`);
      console.log(`The address of the owner of the auction Item is ${address}.`);
    };
    interact.showAuctionProps = async (satringBid, timeout) => {
      console.log(`The starting Bid for the auction is ${startingBid}.`);
      console.log(`The duration of the auction is ${timeout}.`);
    };
  };

  interact.getBid = async (currentPrice) => {
    console.log(`The currentPrice of the auction item is ${currentPrice}`);
    const bid = await ask(
      'What do you to wish bid.....It must be greater than current price.',
      (x => x)
    );
    return bid;
  };

  
  interact.showOwner = async (name, newOwner, auctionItem) => {
    console.log(`The New Owner of ${name} is: ${newOwner}`);
    console.log(`The auction item information is ${auctionItem}`);
  };

  const part = isCreator ? backend.Creator : backend.Owner;
  await part(ctc, interact);

  const after = await getBalance();
  console.log(`Your balance is now ${after}`);

  done();
})();