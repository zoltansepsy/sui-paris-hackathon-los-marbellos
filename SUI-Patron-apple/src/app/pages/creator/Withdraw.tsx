import React from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Landmark,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card, Button, Badge, cn } from "../../components/ui/Shared";
import { MOCK_CREATORS } from "../../mockData";

export function WithdrawFlow() {
  const creator = MOCK_CREATORS[0];
  const [amount, setAmount] = React.useState<string>("");
  const [method, setMethod] = React.useState<"bank" | "paypal" | "crypto">(
    "bank",
  );
  const [step, setStep] = React.useState<"input" | "confirm" | "success">(
    "input",
  );

  const maxAmount = creator.totalEarnings; // Mock balance
  const minPayout = 50;

  const handleNext = () => {
    if (!amount || Number(amount) < minPayout || Number(amount) > maxAmount)
      return;
    setStep("confirm");
  };

  const handleConfirm = () => {
    setStep("success");
  };

  if (step === "success") {
    return (
      <div className="max-w-md mx-auto text-center pt-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Withdrawal Initiated
        </h1>
        <p className="text-gray-500 mb-8">
          Your funds are on the way. Expect them in 1-3 business days.
        </p>

        <Card className="p-4 bg-gray-50 mb-8 text-left text-sm">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-500">Amount</span>
            <span className="font-bold">${Number(amount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-gray-500">Method</span>
            <span className="font-medium capitalize">{method} Transfer</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Reference ID</span>
            <span className="font-mono text-gray-700">#WD-99283</span>
          </div>
        </Card>

        <Link to="/creator/dashboard">
          <Button className="w-full">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        to="/creator/dashboard"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Withdraw Balance</h1>
        <p className="text-gray-500">Transfer your earnings to your account.</p>
      </div>

      <Card className="p-6">
        <div className="bg-indigo-50 rounded-lg p-4 flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide">
              Available Balance
            </p>
            <p className="text-2xl font-bold text-indigo-900">
              ${maxAmount.toLocaleString()}
            </p>
          </div>
          <DollarSign className="w-8 h-8 text-indigo-300" />
        </div>

        {step === "input" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdrawal Amount
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-3 border text-lg"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button
                    onClick={() => setAmount(maxAmount.toString())}
                    className="h-full rounded-md border-transparent bg-transparent py-0 pl-2 pr-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                  >
                    Max
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" /> Minimum withdrawal is $
                {minPayout}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payout Method
              </label>
              <div className="space-y-3">
                {[
                  {
                    id: "bank",
                    label: "Bank Transfer",
                    desc: "1-3 business days • Free",
                  },
                  { id: "paypal", label: "PayPal", desc: "Instant • 1% fee" },
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setMethod(m.id as any)}
                    className={cn(
                      "flex items-center p-4 border rounded-lg cursor-pointer transition-colors",
                      method === m.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300",
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border mr-3 flex items-center justify-center",
                        method === m.id
                          ? "border-indigo-600"
                          : "border-gray-400",
                      )}
                    >
                      {method === m.id && (
                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{m.label}</p>
                      <p className="text-xs text-gray-500">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="w-full h-12"
              disabled={
                !amount ||
                Number(amount) < minPayout ||
                Number(amount) > maxAmount
              }
              onClick={handleNext}
            >
              Review Withdrawal
            </Button>
          </div>
        )}

        {step === "confirm" && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Withdrawal Amount</span>
                <span className="font-medium text-gray-900">
                  ${Number(amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-900 capitalize">
                  {method}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fees</span>
                <span className="font-medium text-gray-900">$0.00</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total Payout</span>
                <span className="font-bold text-indigo-600 text-lg">
                  ${Number(amount).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("input")}
              >
                Back
              </Button>
              <Button className="flex-1" onClick={handleConfirm}>
                Confirm Withdrawal
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
