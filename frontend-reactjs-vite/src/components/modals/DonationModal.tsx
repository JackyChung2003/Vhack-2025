import React, { useState, useEffect } from "react";
import { FaTimes, FaHandHoldingHeart, FaCreditCard, FaRegCreditCard, FaRegCalendarAlt, FaLock, FaInfoCircle, FaArrowRight, FaMoneyBillWave, FaEye, FaEyeSlash } from "react-icons/fa";
import { mockDonorAutoDonations } from "../../utils/mockData";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDonationComplete: (amount: number, donationPolicy?: string, isAnonymous?: boolean) => void;

  // Support either the new props
  targetName?: string;
  targetType?: 'campaign' | 'organization';
  targetId?: number;
  targetCategory?: string;

  // Or the old props
  campaignId?: number;
  campaignName?: string;
  organizationId?: number;
  organizationName?: string;

  donationPolicy?: string;
}

const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  onDonationComplete,
  targetName,
  targetType,
  targetId,
  targetCategory,
  campaignId,
  campaignName,
  organizationId,
  organizationName,
  donationPolicy
}) => {
  const [step, setStep] = useState<'amount' | 'payment' | 'confirmation'>('amount');
  const [donationType, setDonationType] = useState<'one-time' | 'monthly'>('one-time');
  const [selectedDonationPolicy, setSelectedDonationPolicy] = useState<'always-donate' | 'campaign-specific'>('always-donate');
  const [amount, setAmount] = useState<number | ''>('');
  const [customAmount, setCustomAmount] = useState<boolean>(false);

  // Payment form state (placeholder for Stripe)
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAutodonationInfo, setShowAutodonationInfo] = useState(false);

  const predefinedAmounts = [10, 25, 50, 100, 250];

  // Derive values from either new or old props
  const derivedTargetName = targetName || campaignName || organizationName || "";
  const derivedTargetType = targetType || (campaignId ? 'campaign' : 'organization');
  const derivedTargetId = targetId || campaignId || organizationId || 0;

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setCustomAmount(false);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d{0,2})?$/.test(value)) {
      setAmount(value === '' ? '' : parseFloat(value));
    }
  };

  const handlePolicyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDonationPolicy(e.target.value === "always-donate" ? 'always-donate' : 'campaign-specific');
  };

  const handleNextStep = () => {
    if (step === 'amount' && amount) {
      setStep('payment');
    } else if (step === 'payment') {
      handleSubmit();
    } else if (step === 'confirmation') {
      handleClose();
    }
  };

  const handleBack = () => {
    if (step === 'payment') {
      setStep('amount');
    }
  };

  const handleClose = () => {
    // Reset state before closing
    setStep('amount');
    setAmount('');
    setCustomAmount(false);
    setCardName('');
    onClose();
  };

  const handleSubmit = () => {
    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
      // If this is a monthly donation, create an auto donation record
      if (donationType === 'monthly') {
        createAutodonationRecord();
      }

      if (onDonationComplete && typeof amount === 'number') {
        // Pass the selectedDonationPolicy for campaigns to onDonationComplete
        if (derivedTargetType === 'campaign') {
          onDonationComplete(amount, selectedDonationPolicy, false);
        } else {
          onDonationComplete(amount, undefined, false);
        }
      }
      setIsProcessing(false);
      resetForm();
      onClose();
    }, 1500);
  };

  const resetForm = () => {
    setStep('amount');
    setAmount('');
    setCustomAmount(false);
    setCardName('');
    setDonationType('one-time');
    setSelectedDonationPolicy('always-donate');
  };

  const createAutodonationRecord = () => {
    // In a real app, this would call an API to create the auto donation record
    console.log('Creating auto donation record for monthly donation');

    // Generate a new ID (in a real app, this would come from the backend)
    const newId = Math.max(...mockDonorAutoDonations.map(d => d.id)) + 1;

    // Calculate next donation date (1 month from now)
    const today = new Date();
    const nextDonationDate = new Date(today);
    nextDonationDate.setMonth(today.getMonth() + 1);

    // Create the new auto donation record
    const newAutodonation = {
      id: newId,
      amount: amount,
      frequency: "monthly",
      donationType: "direct" as const,
      isAnonymous: false,
      directRecipient: {
        id: derivedTargetId,
        name: derivedTargetName,
        type: derivedTargetType,
        category: targetCategory
      },
      startDate: today.toISOString().split('T')[0],
      nextDonationDate: nextDonationDate.toISOString().split('T')[0],
      distributions: [
        {
          date: today.toISOString().split('T')[0],
          recipients: [
            {
              id: derivedTargetId,
              name: derivedTargetName,
              type: derivedTargetType,
              amount: amount,
              category: targetCategory
            }
          ]
        }
      ]
    };

    // In a real app, this would be handled by the backend
    // For now, we'll just log it
    console.log('New auto donation record:', newAutodonation);

    // Show info about auto donation management
    setShowAutodonationInfo(true);
  };

  if (!isOpen) return null;

  const displayName = campaignName || organizationName || "this cause";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-xl font-bold text-[#006838] flex items-center gap-2">
            <span className="text-[#F9A826]">🤲</span>
            Make a Donation
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {step === 'amount' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-md font-semibold text-[#006838] mb-2 flex items-center">
                  <span className="bg-[#F9A826] text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-sm">1</span>
                  Select Donation Type
                </h3>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    className={`relative overflow-hidden py-4 px-4 rounded-lg transition-all duration-300 ${donationType === 'one-time'
                        ? 'bg-[#F9A826] text-white'
                        : 'border border-gray-300 text-gray-700 hover:border-[#F9A826]'
                      }`}
                    onClick={() => setDonationType('one-time')}
                  >
                    {donationType === 'one-time' && (
                      <div className="absolute top-2 right-2 text-xs font-medium">
                        Selected
                      </div>
                    )}
                    <div className="text-center">
                      <div className="font-bold mb-1">One-time</div>
                      <div className="text-xs">Single donation</div>
                    </div>
                  </button>
                  <button
                    className={`relative overflow-hidden py-4 px-4 rounded-lg transition-all duration-300 ${donationType === 'monthly'
                        ? 'bg-[#F9A826] text-white'
                        : 'border border-gray-300 text-gray-700 hover:border-[#F9A826]'
                      }`}
                    onClick={() => setDonationType('monthly')}
                  >
                    {donationType === 'monthly' && (
                      <div className="absolute top-2 right-2 text-xs font-medium">
                        Selected
                      </div>
                    )}
                    <div className="text-center">
                      <div className="font-bold mb-1">Monthly</div>
                      <div className="text-xs">Recurring donation</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Campaign donation policy - only show for campaign donations */}
              {campaignId && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-[#006838] mb-2 flex items-center">
                    <span className="bg-[#F9A826] text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-sm">2</span>
                    Donation Policy
                  </h3>
                  <div className="space-y-3 mt-2">
                    <button
                      className={`w-full p-3 rounded-lg transition-all duration-300 text-left relative ${selectedDonationPolicy === 'always-donate'
                          ? 'bg-[#F9A826] text-white'
                          : 'border border-gray-300 text-gray-700 hover:border-[#F9A826]'
                        }`}
                      onClick={() => setSelectedDonationPolicy('always-donate')}
                    >
                      {selectedDonationPolicy === 'always-donate' && (
                        <div className="absolute top-2 right-2 text-xs font-medium">
                          Selected
                        </div>
                      )}
                      <div className="flex items-start">
                        <div className={`w-5 h-5 rounded-full mr-3 mt-0.5 flex items-center justify-center ${selectedDonationPolicy === 'always-donate'
                            ? 'border-2 border-white'
                            : 'border border-gray-400'
                          }`}>
                          {selectedDonationPolicy === 'always-donate' && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold">Always Donate</h4>
                          <p className="text-sm mt-1">
                            Your donation will support the organization even if the campaign doesn't reach its goal.
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      className={`w-full p-3 rounded-lg transition-all duration-300 text-left relative ${selectedDonationPolicy === 'campaign-specific'
                          ? 'bg-[#F9A826] text-white'
                          : 'border border-gray-300 text-gray-700 hover:border-[#F9A826]'
                        }`}
                      onClick={() => setSelectedDonationPolicy('campaign-specific')}
                    >
                      {selectedDonationPolicy === 'campaign-specific' && (
                        <div className="absolute top-2 right-2 text-xs font-medium">
                          Selected
                        </div>
                      )}
                      <div className="flex items-start">
                        <div className={`w-5 h-5 rounded-full mr-3 mt-0.5 flex items-center justify-center ${selectedDonationPolicy === 'campaign-specific'
                            ? 'border-2 border-white'
                            : 'border border-gray-400'
                          }`}>
                          {selectedDonationPolicy === 'campaign-specific' && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold">Campaign-Specific</h4>
                          <p className="text-sm mt-1">
                            You can get a refund if the campaign doesn't reach its goal.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Donation Amount */}
              <div>
                <h3 className="text-md font-semibold text-[#006838] mb-2">Donation Amount</h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {predefinedAmounts.map((predefinedAmount) => (
                    <button
                      key={predefinedAmount}
                      onClick={() => handleAmountSelect(predefinedAmount)}
                      className={`py-2 rounded-lg ${amount === predefinedAmount && !customAmount
                          ? 'bg-[#F9A826] text-white'
                          : 'border border-gray-300 hover:border-[#F9A826] text-gray-700'
                        }`}
                    >
                      RM{predefinedAmount}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setCustomAmount(true);
                      setAmount('');
                    }}
                    className={`py-2 rounded-lg ${customAmount
                        ? 'bg-[#F9A826] text-white'
                        : 'border border-gray-300 hover:border-[#F9A826] text-gray-700'
                      }`}
                  >
                    Custom
                  </button>
                </div>

                {customAmount && (
                  <div className="mt-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">RM</span>
                      </div>
                      <input
                        type="text"
                        value={amount}
                        onChange={handleCustomAmountChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F9A826] focus:border-[#F9A826]"
                        placeholder="Enter amount"
                        autoFocus
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--headline)] mb-2">Donation Summary</h3>
                <div className="bg-[var(--background)] p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Donation to:</span>
                    <span className="font-semibold">{displayName}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Amount:</span>
                    <span className="font-semibold">RM{amount}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Frequency:</span>
                    <span className="font-semibold">{donationType === 'monthly' ? 'Monthly' : 'One-time'}</span>
                  </div>
                  {campaignId && (
                    <div className="flex justify-between mb-2">
                      <span>Policy:</span>
                      <span className="font-semibold">
                        {selectedDonationPolicy === 'always-donate' ? 'Always Donate' : 'Campaign Specific'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Credit Card Form (Placeholder) */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--headline)] mb-4">Payment Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--paragraph)] mb-1">Card Holder Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-[var(--stroke)] rounded-lg"
                      placeholder="Enter name on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--paragraph)] mb-1">Card Number</label>
                    <div className="w-full px-4 py-3 border border-[var(--stroke)] rounded-lg bg-white flex items-center">
                      <FaRegCreditCard className="text-[var(--paragraph)] mr-2" />
                      <span className="text-[var(--paragraph)]">•••• •••• •••• ••••</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--paragraph)] mb-1">Expiration Date</label>
                      <div className="w-full px-4 py-3 border border-[var(--stroke)] rounded-lg bg-white flex items-center">
                        <FaRegCalendarAlt className="text-[var(--paragraph)] mr-2" />
                        <span className="text-[var(--paragraph)]">MM / YY</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--paragraph)] mb-1">Security Code</label>
                      <div className="w-full px-4 py-3 border border-[var(--stroke)] rounded-lg bg-white flex items-center">
                        <FaLock className="text-[var(--paragraph)] mr-2" />
                        <span className="text-[var(--paragraph)]">•••</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center text-sm text-[var(--paragraph)]">
                  <FaLock className="mr-2" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaHandHoldingHeart className="text-green-600 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--headline)] mb-2">Thank You for Your Support!</h3>
              <p className="text-[var(--paragraph)] mb-6">
                Your donation of RM{amount} {donationType === 'monthly' ? 'per month ' : ''}to {displayName} has been processed successfully.
              </p>
              {campaignId && (
                <div className="bg-[var(--background)] p-4 rounded-lg mb-6 text-left">
                  <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-[var(--highlight)] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm mb-2">
                        <span className="font-medium">Donation Policy: </span>
                        <span className={selectedDonationPolicy === 'always-donate' ? 'text-blue-600' : 'text-green-600'}>
                          {selectedDonationPolicy === 'always-donate' ? 'Always Donate' : 'Campaign Specific'}
                        </span>
                      </p>
                      <p className="text-sm">
                        {selectedDonationPolicy === 'always-donate'
                          ? 'If this campaign does not reach its target by the deadline and not extended, your donation will support other initiatives by the organization.'
                          : 'If this campaign does not reach its target by the deadline and not extended, your donation will be refunded to you.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <p className="text-[var(--paragraph)]">
                A receipt has been sent to your email address.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between">
          {step === 'payment' ? (
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={handleNextStep}
            disabled={step === 'amount' && !amount || isProcessing}
            className={`px-6 py-2 rounded-lg ${step === 'amount' && !amount
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[#F9A826] text-white hover:bg-[#e99615]'
              } transition-colors flex items-center justify-center min-w-[120px]`}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing
              </span>
            ) : (
              step === 'confirmation' ? 'Close' : 'Continue'
            )}
          </button>
        </div>
      </div>

      {/* Auto donation info modal */}
      {showAutodonationInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--main)] rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMoneyBillWave className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-[var(--headline)]">Monthly Donation Set Up!</h3>
              <p className="text-[var(--paragraph)] mt-2">
                Your monthly donation of RM{amount} to {displayName} has been set up successfully.
              </p>
            </div>

            <div className="bg-[var(--background)] p-4 rounded-lg mb-4">
              <p className="text-sm">
                <strong>Important:</strong> You can manage or cancel this recurring donation at any time from the Auto Donations section.
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowAutodonationInfo(false);
                  window.location.href = '/charity?tab=autoDonate';
                }}
                className="px-4 py-2 bg-[var(--highlight)] text-white rounded-lg shadow-md hover:bg-opacity-90 transition-all"
              >
                Go to Auto Donations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationModal; 