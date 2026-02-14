import React from "react";
import { useParams, Link } from "react-router-dom";
import { Check, CreditCard, Shield, ArrowRight, Wallet } from "lucide-react";
import { Card, Button } from "../../components/ui/Shared";
import { MOCK_CREATORS } from "../../mockData";
import { motion } from "motion/react";

export function PaymentFlow() {
  const { id } = useParams<{ id: string }>();
  const creator = MOCK_CREATORS.find((c) => c.id === id) || MOCK_CREATORS[0];

  const [step, setStep] = React.useState<"summary" | "processing" | "success">(
    "summary",
  );

  const handlePayment = () => {
    setStep("processing");
    setTimeout(() => {
      setStep("success");
    }, 2000);
  };

  if (step === "success") {
    return (
      <div className="max-w-md mx-auto text-center pt-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-500">
            You now have an AccessPass for {creator.name}.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 mb-8 transform hover:scale-105 transition-transform duration-300">
            <div className="bg-white rounded-lg p-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wallet className="w-32 h-32" />
              </div>
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={creator.avatar}
                  className="w-12 h-12 rounded-full border-2 border-indigo-100"
                />
                <div className="text-left">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    AccessPass NFT
                  </p>
                  <p className="font-bold text-gray-900">
                    {creator.name} Supporter
                  </p>
                </div>
              </div>
              <div className="h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1633176640669-44bd6adaa662?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwzZCUyMGJhZGdlJTIwZ29sZCUyMHNoaW55fGVufDF8fHx8MTc3MTAyNzA0Nnww&ixlib=rb-4.1.0&q=80&w=1080"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 font-mono">
                <span>ID: #8932...AF2</span>
                <span>Valid: Forever</span>
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <Link to={`/creator/${creator.id}`}>
              <Button className="w-full">Go to Content</Button>
            </Link>
            <Link to="/passes">
              <Button variant="outline" className="w-full">
                View My Wallet
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="max-w-md mx-auto text-center pt-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600 mx-auto mb-6"></div>
        <h2 className="text-xl font-bold text-gray-900">
          Processing Payment...
        </h2>
        <p className="text-gray-500 mt-2">
          Minting your AccessPass NFT on the blockchain.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Complete Purchase
          </h1>
          <p className="text-gray-500">
            Unlock exclusive content from {creator.name}.
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-2">
            Order Summary
          </h3>
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center">
              <img src={creator.avatar} className="w-8 h-8 rounded-full mr-3" />
              <span className="text-sm font-medium">
                {creator.name} AccessPass
              </span>
            </div>
            <span className="font-bold">
              ${creator.accessPassPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 text-gray-500 text-sm">
            <span>Platform Fee</span>
            <span>$0.50</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>${(creator.accessPassPrice + 0.5).toFixed(2)}</span>
          </div>
        </Card>

        <div className="flex items-center text-xs text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-100">
          <Shield className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
          Your payment is secure and an NFT will be minted to your wallet
          automatically.
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <h3 className="font-bold text-gray-900">Payment Method</h3>

        <div className="space-y-4">
          <div className="border rounded-lg p-4 flex items-center space-x-3 border-indigo-500 bg-indigo-50">
            <div className="w-4 h-4 rounded-full border-4 border-indigo-600"></div>
            <CreditCard className="w-5 h-5 text-gray-700" />
            <span className="font-medium text-gray-900">
              Credit / Debit Card
            </span>
          </div>

          <div className="border rounded-lg p-4 flex items-center space-x-3 opacity-60">
            <div className="w-4 h-4 rounded-full border border-gray-300"></div>
            <Wallet className="w-5 h-5 text-gray-700" />
            <span className="font-medium text-gray-900">Crypto Wallet</span>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 border shadow-sm p-2 sm:text-sm"
              placeholder="0000 0000 0000 0000"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Expiry
              </label>
              <input
                type="text"
                className="block w-full rounded-md border-gray-300 border shadow-sm p-2 sm:text-sm"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                CVC
              </label>
              <input
                type="text"
                className="block w-full rounded-md border-gray-300 border shadow-sm p-2 sm:text-sm"
                placeholder="123"
              />
            </div>
          </div>
        </div>

        <Button className="w-full h-12 text-lg" onClick={handlePayment}>
          Pay ${(creator.accessPassPrice + 0.5).toFixed(2)}{" "}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </Card>
    </div>
  );
}
