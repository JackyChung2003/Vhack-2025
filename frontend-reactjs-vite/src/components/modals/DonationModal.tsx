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
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  
  // Payment form state (placeholder for Stripe)
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAutodonationInfo, setShowAutodonationInfo] = useState(false);

  // Check for user's preference for anonymous donations
  useEffect(() => {
    // Get setting from localStorage
    const anonymousSetting = localStorage.getItem('anonymousDonation');
    if (anonymousSetting === 'true') {
      setIsAnonymous(true);
    }
  }, []);

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

  const handleAnonymousToggle = () => {
    setIsAnonymous(!isAnonymous);
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
          onDonationComplete(amount, selectedDonationPolicy, isAnonymous);
        } else {
          onDonationComplete(amount, undefined, isAnonymous);
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
    // Don't reset isAnonymous as it depends on user preference
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
      isAnonymous: isAnonymous,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--main)] rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[var(--stroke)] flex justify-between items-center">
          <h2 className="text-xl font-bold text-[var(--headline)]">
            Make a Donation
          </h2>
          <button 
            onClick={handleClose}
            className="text-[var(--paragraph)] hover:text-[var(--headline)] transition-colors"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {step === 'amount' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[var(--headline)] mb-2">Select Donation Type</h3>
                <div className="flex rounded-lg overflow-hidden border border-[var(--stroke)]">
                  <button
                    className={`flex-1 py-3 px-4 ${donationType === 'one-time' ? 'bg-[var(--highlight)] text-white' : 'bg-[var(--background)]'}`}
                    onClick={() => setDonationType('one-time')}
                  >
                    One-time
                  </button>
                  <button
                    className={`flex-1 py-3 px-4 ${donationType === 'monthly' ? 'bg-[var(--highlight)] text-white' : 'bg-[var(--background)]'}`}
                    onClick={() => setDonationType('monthly')}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              
              {/* Campaign donation policy - only show for campaign donations */}
              {campaignId && (
                <div>
                  <h3 className="text-lg font-semibold text-[var(--headline)] mb-2">Donation Policy</h3>
                  <div className="space-y-3">
                    <div 
                      className={`p-4 rounded-lg border cursor-pointer ${
                        selectedDonationPolicy === 'always-donate' 
                          ? 'border-[var(--highlight)] bg-[var(--highlight)] bg-opacity-10' 
                          : 'border-[var(--stroke)]'
                      }`}
                      onClick={() => setSelectedDonationPolicy('always-donate')}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full border border-[var(--highlight)] flex items-center justify-center mt-1">
                          {selectedDonationPolicy === 'always-donate' && (
                            <div className="w-3 h-3 rounded-full bg-[var(--highlight)]"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-[var(--headline)]">Always Donate</h4>
                          <p className="text-sm text-[var(--paragraph)]">
                            If the campaign doesn't reach its target, your donation will be moved to the organization's general fund for other initiatives.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`p-4 rounded-lg border cursor-pointer ${
                        selectedDonationPolicy === 'campaign-specific' 
                          ? 'border-[var(--highlight)] bg-[var(--highlight)] bg-opacity-10' 
                          : 'border-[var(--stroke)]'
                      }`}
                      onClick={() => setSelectedDonationPolicy('campaign-specific')}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full border border-[var(--highlight)] flex items-center justify-center mt-1">
                          {selectedDonationPolicy === 'campaign-specific' && (
                            <div className="w-3 h-3 rounded-full bg-[var(--highlight)]"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-[var(--headline)]">Campaign-Specific</h4>
                          <p className="text-sm text-[var(--paragraph)]">
                            If the campaign doesn't reach its target, your donation will be refunded to your wallet.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Donation Amount */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--headline)] mb-2">Donation Amount</h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {predefinedAmounts.map((predefinedAmount) => (
                    <button
                      key={predefinedAmount}
                      onClick={() => handleAmountSelect(predefinedAmount)}
                      className={`py-3 rounded-lg border ${
                        amount === predefinedAmount && !customAmount
                          ? 'bg-[var(--highlight)] text-white border-[var(--highlight)]'
                          : 'border-[var(--stroke)] hover:bg-[var(--background)]'
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
                    className={`py-3 rounded-lg border ${
                      customAmount
                        ? 'bg-[var(--highlight)] text-white border-[var(--highlight)]'
                        : 'border-[var(--stroke)] hover:bg-[var(--background)]'
                    }`}
                  >
                    Custom
                  </button>
                </div>
                
                {customAmount && (
                  <div className="mt-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-[var(--paragraph)]">RM</span>
                      </div>
                      <input
                        type="text"
                        value={amount}
                        onChange={handleCustomAmountChange}
                        className="w-full pl-10 pr-4 py-3 border border-[var(--stroke)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--highlight)]"
                        placeholder="Enter amount"
                        autoFocus
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Anonymous Donation Toggle */}
              <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-lg border border-[var(--stroke)]">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-[var(--highlight)]">
                    {isAnonymous ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                  </div>
                  <div>
                    <h4 className="font-medium text-[var(--headline)]">Anonymous Donation</h4>
                    <p className="text-sm text-[var(--paragraph)] mt-1">
                      Your name will not be shown on public leaderboards or donor lists
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isAnonymous}
                    onChange={handleAnonymousToggle}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[var(--highlight)]"></div>
                </label>
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
                  <div className="flex justify-between">
                    <span>Anonymity:</span>
                    <span className="font-semibold flex items-center gap-1">
                      {isAnonymous ? (
                        <>
                          <FaEyeSlash className="text-[var(--highlight)]" />
                          Anonymous
                        </>
                      ) : (
                        <>
                          <FaEye className="text-[var(--highlight)]" />
                          Public
                        </>
                      )}
                    </span>
                  </div>
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
              {isAnonymous && (
                <div className="bg-[var(--background)] p-4 rounded-lg mb-6 text-left">
                  <div className="flex items-start gap-2">
                    <FaEyeSlash className="text-[var(--highlight)] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm mb-2">
                        <span className="font-medium">Anonymous Donation</span>
                      </p>
                      <p className="text-sm">
                        Your donation will be recorded privately. Your name won't appear on public donor lists.
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
        <div className="p-6 border-t border-[var(--stroke)] flex justify-between">
          {step === 'payment' ? (
            <button
              onClick={handleBack}
              className="px-6 py-3 border border-[var(--stroke)] rounded-lg hover:bg-[var(--background)] transition-colors"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}
          
          <button
            onClick={handleNextStep}
            disabled={step === 'amount' && !amount || isProcessing}
            className={`px-6 py-3 rounded-lg ${
              step === 'amount' && !amount
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-[var(--highlight)] text-white hover:bg-opacity-90'
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