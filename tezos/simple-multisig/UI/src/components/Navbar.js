import { useEffect, useState } from "react";
import { connectWallet, getAccount} from "../utils/wallet";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [account, setAccount] = useState("");

  useEffect(() => {
    (async () => {
      const activeAccount = await getAccount();
      setAccount(activeAccount);
    })();
  }, []);

  
  const onConnectWallet = async () => {

    await connectWallet();
    const activeAccount = await getAccount();
    setAccount(activeAccount);

  };

  const navigate = useNavigate(); 

  return (
    <div className="navbar navbar-dark bg-dark fixed-top">
      <div className="container py-2">
        <a href="/" className="navbar-brand">
          Cryptonomic Multisig
        </a>
        <div className="d-flex">
        <button onClick={() => (navigate('home'))}>
            Home
          </button>
        <button onClick={() => (navigate('operations'))}>
            New Operation
          </button>
          <button onClick={() => (navigate('storage'))}>
            Pending Operations
          </button>
          <button onClick={() => (navigate('parameters'))}>
            Change Parameters
          </button>
          <button onClick={onConnectWallet} lassName="btn btn-outline-info">
            {/* TODO 5.a - Show account address if wallet is connected */}
            {account !== "" ? account : "Connect Wallet"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
