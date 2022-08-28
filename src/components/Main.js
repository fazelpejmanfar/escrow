/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import ABI from './ABI.json';
import { ethers } from 'ethers';
import toast, { Toaster } from 'react-hot-toast';

function Main() {
    const [address, setaddress] = useState();
    let ContractAddress = "0x488bC079442cBB30e2B5b90068556b232EB6d0DD";
    const [Escrow, setEscrow] = useState();
    const [Client, setClient] = useState();
    const [Seller, setSeller] = useState();
    const [State, setState] = useState();
    const [Amount, setAmount] = useState("0.1");
    const [NewClient, setNewClient] = useState();
    const [Balance, setBalance] = useState(0);

    const connect = async() => {
    if (window.ethereum) {
        toast.loading("Connecting...");
       const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const NID = await window.ethereum.request({
        method: "net_version"
       });
       const provider = new ethers.providers.Web3Provider(window.ethereum);
       const signer = provider.getSigner();
       const contract = new ethers.Contract(ContractAddress, ABI, signer);
       setEscrow(contract);
       if(NID === "4") {
        const Client = await contract.Client();
        setClient(String(Client).toLowerCase());
        const Owner = await contract.Seller();
        setSeller(String(Owner).toLowerCase());
        const State = await contract.CurrentState();
        setState(State);
        const Balance = await contract.ContractBalance();
        setBalance(Number(Balance));
        setaddress(accounts[0]);
        toast.dismiss();
        toast.success("Wallet Connected");
        //event listerns
        window.ethereum.on("accountsChanged", (accounts) => {
            setaddress(accounts[0])
        });
        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });
    } else {
        toast.dismiss();
        toast.error("Please Change Network to Rinkeby");
    }
 } else {
    toast.dismiss();
    toast.error("Please Install MetaMask");
 }
};

    const Pay = async() => {
        toast.loading('Sending The Payment....');
        try {
        const Payment = await Escrow.deposit({
            value: ethers.utils.parseEther(Amount),
            gasLimit: 285000
        });
        const TX = await Payment.wait()
        .then(async(receipt) => {
            toast.dismiss();
            toast.success("Payment was Successfull...");
            const State = await Escrow.CurrentState();
            setState(State);
        });
    } catch (err) {
        toast.dismiss();
        toast.error(`${String(err).substring(0,33)}`)
    }
    };

    const ConfirmDelivery = async() => {
        toast.loading('Confirming The Delivery....');
        try {
            const Confirm = await Escrow.confirmDelivery({
                gasLimit: 285000
            });
            const TX = await Confirm.wait()
            .then(async(receipt) => {
                toast.dismiss();
                toast.success("Confirmed...");
                const State = await Escrow.CurrentState();
                setState(State);
            });
        } catch (err) {
            toast.dismiss();
            toast.error(`${String(err).substring(0,33)}`)
        }
    };

    const ChangeClient = async() => {
        toast.loading('Chainging The Client....');
        try {
            const Change = await Escrow.ChangeClient(NewClient, {
                gasLimit: 285000
            });
            const TX = await Change.wait()
            .then(async(receipt) => {
                toast.dismiss();
                toast.success("Client Changed...");
                const State = await Escrow.CurrentState();
                setState(State);
            });
        } catch (err) {
            toast.dismiss();
            toast.error(`${String(err).substring(0,33)}`)
        }
    };

    const ReNewClient = async() => {
        toast.loading('Renewing Current Client....');
        try {
            const ReNew = await Escrow.renewCurrentClient({
                gasLimit: 285000
            });
            const TX = await ReNew.wait()
            .then(async(receipt) => {
                toast.dismiss();
                toast.success("Client ReNewed...");
                const State = await Escrow.CurrentState();
                setState(State);
            });
        } catch (err) {
            toast.dismiss();
            toast.error(`${String(err).substring(0,33)}`)
        }
    };


  return (
    <div className="container mx-auto flex justify-center items-center flex-col min-h-screen bg-[#100720]">
 <Toaster />
    <div className='container min-w-full h-16 absolute top-0 rounded-sm bg-[#31087B] drop-shadow-2xl flex items-center justify-between pr-5 pl-5'>
    {address !== undefined ? (
        <>
        <button className='bg-[#FFC23C] w-40 h-7 rounded-xl flex justify-center items-center hover:bg-yellow-700 hover:text-white'
        onClick={(e) => {
        e.preventDefault();
        connect();
         }}>
        {String(address).substring(0,8)}...{String(address).substring(36,42)}
    </button>
        </>
    ) : (
        <>
    <button className='bg-[#FFC23C]  w-40 h-7 rounded-xl flex justify-center items-center hover:bg-yellow-700 hover:text-white'
    onClick={(e) => {
        e.preventDefault();
        connect();
    }}>
        Connect
    </button>
        </>
    )}
    <h3 className='text-3x text-white font-bold font-mono'>
        Escrow Dapp
    </h3>
    </div>

    <div className="container flex justify-center items-center md:w-9/12 w-full h-96 drop-shadow-2xl rounded-xl bg-[#31087B]">
    {address === undefined ? (
        <>
        <h3 className='text-3x text-white font-mono text-center'>
    Please Conenct Your Wallet
    </h3>
        </>
    ) : (
        <>
        <div className=' w-full flex flex-col justify-evenly h-80 items-center'>
        {String(address).substring(36,42) === String(Client).substring(36,42) ? (
            <>

        {State === 1 ? (
            <>
            <h3 className='text-3x text-white font-mono text-center'>
        You Already Paid
        </h3>

        <button className=' w-40 h-9 bg-[#FFC23C] text-black rounded-md hover:bg-yellow-700 hover:text-white' onClick={(e) => {
            e.preventDefault();
            ConfirmDelivery();
        }}>
          Confirm Delivery
        </button>
            </>
        ) : State === 0 ? (
            <>
            <h3 className='text-3x text-white font-mono text-center'>
        Welcome
        </h3>
            <h3 className='text-3x text-white font-mono text-center'>
        Enter Amount
        </h3>

            <input className=' rounded-sm pr-1 pl-1' type={'number'} placeholder="0.01" 
                onChange={(e) => {
                    e.preventDefault();
                    setAmount(e.target.value);
                }}
            />
         <button className=' w-40 h-9 bg-[#FFC23C] text-black rounded-md hover:bg-yellow-700 hover:text-white' onClick={(e) => {
            e.preventDefault();
            Pay();
         }}>
          Pay
        </button>
            </>
        ) : (
            <>
            <h3 className='text-3x text-white font-mono text-center'>
        Work is Done...
        </h3>
            </>
        )}
            </>
        ) : String(address).substring(36,42) === String(Seller).substring(36,42) ? (
            <>
            <h3 className='text-3x text-white font-mono text-center'>
        Welcome Boss <br></br>
        Contract Balance: <span style={{color: '#FFC23C'}}> {String(Balance) / 1e18}</span> 
        </h3>
        <h3 className='text-3x text-white font-mono text-center'>
        Current Phase: <br></br>
        {State === 0 ? <span style={{color: '#FFC23C'}}>Awaiting Payment</span> : 
        State === 1 ? <span style={{color: '#FFC23C'}}>Awaiting Delivery</span>
         : <span style={{color: '#FFC23C'}}>Completed</span>}
        </h3>

        {State === 0 || State === 1 ? (
            <>
            <h3 className='text-3x text-white font-mono text-center'>
            Sorry You Cant Change Client till Client Confirm The Delivery....
           </h3> 
            </>
        ) : (
            <>
            <div className='flex justify-center items-center flex-col text-center gap-2'>
            <input className=' rounded-sm pr-1 pl-1 w-80' type={'text'} placeholder="New Client Address" 
                onChange={(e) => {
                    e.preventDefault();
                    setNewClient(e.target.value);
                }}
            />
         <button className=' w-40 h-9 bg-[#FFC23C] text-black rounded-md hover:bg-yellow-700 hover:text-white' onClick={(e) => {
            e.preventDefault();
            ChangeClient();
         }}>
          Change Client
        </button>
           </div>

          <div className='flex justify-center items-center flex-col text-center gap-2'>
        <h3 className='text-3x text-white font-mono text-center'>
          Current Client is <br></br>
         <span style={{color: '#FFC23C'}}>{Client}</span> 
        </h3>
        <button className=' w-40 h-9 bg-[#FFC23C] text-black rounded-md hover:bg-yellow-700 hover:text-white' onClick={(e) => {
            e.preventDefault();
            ReNewClient();
         }}>
          Renew Client 
        </button>
        </div>
            </>
        )}



            </>
        ) : (
            <>
            <h3 className='text-3x text-white font-mono text-center'>
        Not Owner nor Client
        </h3>
            </>
        )}
        </div>
        </>
    )}

    </div>
    </div>

  )
}

export default Main