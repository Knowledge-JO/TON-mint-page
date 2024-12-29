import {
  TonConnectButton,
  useIsConnectionRestored,
  useTonAddress,
} from "@tonconnect/ui-react";
import "./App.css";
import { useMint } from "./hooks/useMint";

function App() {
  const userFriendlyAddress = useTonAddress(true);
  const connectionRestored = useIsConnectionRestored();
  const {
    timeStatus,
    publicMint,
    whitelistMint,
    nextItemIndex,
    getNextItemIndex,
  } = useMint();

  const isWhitelist =
    Math.floor(Date.now() / 1000) < timeStatus?.publicStartTime;

  const isPublic = Math.floor(Date.now() / 1000) >= timeStatus?.publicStartTime;

  const notStarted = timeStatus?.started == 0;

  const totalRemaining =
    nextItemIndex !== undefined
      ? `${20000 - nextItemIndex}/20000`
      : "Loading...";

  function truncateAddress(address) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
  return (
    <div className="bg-gray-700 text-white min-w-full min-h-screen px-5">
      <div className="flex flex-col items-center gap-3 max-w-xl mx-auto">
        <img src="/cheesetoken.png" alt="Cheese" className="w-28 mx-auto" />
        <p className="text-center">
          Welcome to Cheese Art NFT! Here you can find{" "}
        </p>
        <h1 className="font-bold text-3xl ">Cheese Art NFT</h1>

        <div className="mt-6">
          {/* <button className="bg-blue-500 px-8 py-3 rounded-lg hover:bg-blue-400">
            Connect Wallet
          </button> */}
          <TonConnectButton />
        </div>
        {!connectionRestored ? (
          <>
            <p>Please wait....</p>
          </>
        ) : (
          <div>
            <p className="text-center">Your wallet address:</p>
            <p className="text-center">
              {truncateAddress(userFriendlyAddress)}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4 w-full">
          <h1 className="font-bold text-xl">Investor Mint Phase</h1>
          <div className="flex gap-10 items-center justify-between">
            <p className="w-1/2">Total Supply:</p>
            <p className="w-1/2 text-right">100</p>
          </div>
          <p>You are not eligible to mint this phase</p>
          <button
            disabled={notStarted || !isPublic}
            className="bg-blue-500 px-8 py-3 rounded-lg hover:bg-blue-400 disabled:opacity-50"
            onClick={async () => {
              await publicMint();
              await getNextItemIndex();
            }}
          >
            Mint
          </button>
        </div>
        <div className="mt-6 flex flex-col gap-4 w-full">
          <h1 className="font-bold text-xl">Whitelist Mint Phase</h1>
          <div className="flex gap-10 items-center justify-between">
            <p className="w-1/2">Total Supply:</p>
            <p className="w-1/2 text-right">{totalRemaining}</p>
          </div>
          <p>You are eligible to mint this phase</p>
          <button
            className="bg-blue-500 px-8 py-3 rounded-lg hover:bg-blue-400 disabled:opacity-50"
            disabled={notStarted || !isWhitelist}
            onClick={async () => {
              await whitelistMint();
              await getNextItemIndex();
            }}
          >
            Mint
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
