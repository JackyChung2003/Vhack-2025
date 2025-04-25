import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaTimes, FaHandHoldingHeart, FaCreditCard, FaRegCreditCard, FaRegCalendarAlt, FaLock, FaInfoCircle, FaArrowRight, FaMoneyBillWave, FaEye, FaEyeSlash, FaHeart, FaLink, FaExternalLinkAlt } from "react-icons/fa";
import { mockDonorAutoDonations } from "../../utils/mockData";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { getTransactionExplorerUrl } from "../../services/blockchain/blockchainService";

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDonationComplete: (amount: number, donationPolicy?: string, isAnonymous?: boolean, isRecurring?: boolean, txHash?: string) => void;

  // Support either the new props
  targetName?: string;
  targetType?: 'campaign' | 'organization';
  targetId?: number;
  targetCategory?: string;

  // Or the old props
  campaignId: string;
  campaignName?: string;
  organizationId: string;
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
  const [ethicalInvestment, setEthicalInvestment] = useState<boolean>(false);

  // Define predefined amounts here so we can reference the first one as default
  const predefinedAmounts = [10, 25, 50, 100, 250];

  // Set first predefined amount as default
  const [amount, setAmount] = useState<number | ''>(predefinedAmounts[0]);
  const [customAmount, setCustomAmount] = useState<boolean>(false);

  // Add new state for message
  const [loveMessage, setLoveMessage] = useState<string>('');
  const [showLoveMessage, setShowLoveMessage] = useState<boolean>(false);

  // Payment form state (placeholder for Stripe)
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAutodonationInfo, setShowAutodonationInfo] = useState(false);

  const [showProgressBar, setShowProgressBar] = useState(true);
  const [showImpactSection, setShowImpactSection] = useState(true);
  const [heartAnimation, setHeartAnimation] = useState<'hidden' | 'visible' | 'flying'>('hidden');
  const [progressComplete, setProgressComplete] = useState(false);
  const [sectionCollapsed, setSectionCollapsed] = useState(false);
  const [heartPosition, setHeartPosition] = useState({ top: 0, left: 0 });
  const impactSectionRef = useRef<HTMLDivElement>(null);
  const heartContainerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const monthlyInfoRef = useRef<HTMLDivElement>(null);

  const [activeTooltip, setActiveTooltip] = useState<'always-donate' | 'campaign-specific' | null>(null);
  const tooltipRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const tooltipContentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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
      // Ensure minimum of RM 10 when confirming, but allow typing any value
      setAmount(value === '' ? '' : parseFloat(value));
    }
  };

  const handlePolicyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDonationPolicy(e.target.value === "always-donate" ? 'always-donate' : 'campaign-specific');
  };

  const handleNextStep = () => {
    if (step === 'amount' && amount) {
      // Enforce minimum amount of RM 10 when proceeding
      if (typeof amount === 'number' && amount < 10) {
        toast.error("Minimum donation amount is RM 10");
        return;
      }
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
    setAmount(predefinedAmounts[1]); // Reset to first predefined amount
    setCustomAmount(false);
    setCardName('');
    setLoveMessage('');
    setShowLoveMessage(false);
    setEthicalInvestment(false);
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
        // Also pass whether this is a recurring donation
        const isRecurring = donationType === 'monthly';
        
        // Blockchain transaction hash will be generated in the charityService
        // and passed back here when the donation is complete
        if (derivedTargetType === 'campaign') {
          onDonationComplete(amount, selectedDonationPolicy, false, isRecurring);
        } else {
          onDonationComplete(amount, undefined, false, isRecurring);
        }
      }
      setIsProcessing(false);
      // Update the step state to show confirmation
      setStep('confirmation');
    }, 1500);
  };

  const resetForm = () => {
    setStep('amount');
    setAmount(predefinedAmounts[1]); // Reset to first predefined amount instead of empty
    setCustomAmount(false);
    setCardName('');
    setDonationType('one-time');
    setSelectedDonationPolicy('always-donate');
    setLoveMessage('');
    setShowLoveMessage(false);
    setEthicalInvestment(false);
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

  // Reset animation states when switching to monthly
  useEffect(() => {
    if (donationType === 'monthly') {
      setShowImpactSection(true);
      setHeartAnimation('hidden');
      setProgressComplete(false);
      setSectionCollapsed(false);
    }
  }, [donationType]);

  // Handle progress bar animation complete
  const handleProgressComplete = () => {
    // Mark the progress as complete
    setProgressComplete(true);

    // Get position for heart animation
    if (impactSectionRef.current) {
      const rect = impactSectionRef.current.getBoundingClientRect();
      setHeartPosition({
        top: rect.top + rect.height / 2,
        left: rect.left + rect.width / 2
      });
    }

    // Start heart animation sequence
    setTimeout(() => {
      setHeartAnimation('visible');

      // After heart appears, make it fly away
      setTimeout(() => {
        setHeartAnimation('flying');

        // Start collapsing the section immediately when heart flies
        setSectionCollapsed(true);

        // Clean up after flying animation completes
        setTimeout(() => {
          setHeartAnimation('hidden');
        }, 1500);
      }, 1000);
    }, 400);
  };

  // Handle outside clicks for tooltips
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (activeTooltip) {
      const tooltipButton = tooltipRefs.current[activeTooltip];
      const tooltipContent = tooltipContentRefs.current[activeTooltip];

      // Check if click is outside both tooltip button and content
      if (
        tooltipButton &&
        tooltipContent &&
        !tooltipButton.contains(e.target as Node) &&
        !tooltipContent.contains(e.target as Node)
      ) {
        setActiveTooltip(null);
      }
    }
  }, [activeTooltip]);

  // Add click event listener for tooltip outside clicks
  useEffect(() => {
    if (activeTooltip) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [activeTooltip, handleOutsideClick]);

  // Toggle tooltip visibility
  const handleTooltipToggle = (type: 'always-donate' | 'campaign-specific' | null) => {
    setActiveTooltip(type === activeTooltip ? null : type);
  };

  // Get tooltip position based on button element
  const getTooltipPosition = (type: 'always-donate' | 'campaign-specific') => {
    const button = tooltipRefs.current[type];
    if (!button || !modalRef.current) return { top: 0, left: 0 };

    const buttonRect = button.getBoundingClientRect();
    const modalRect = modalRef.current.getBoundingClientRect();

    return {
      top: buttonRect.top + buttonRect.height + 5,
      left: buttonRect.left + buttonRect.width / 2 - 128, // Center the 256px wide tooltip
    };
  };

  // Handle click outside to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop, not its children
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Tooltip component using Portal
  const Tooltip = ({ type, isVisible }: { type: 'always-donate' | 'campaign-specific', isVisible: boolean }) => {
    if (!isVisible) return null;

    const position = getTooltipPosition(type);

    return createPortal(
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="fixed z-[9999] w-64 bg-[#1E293B] text-white p-3 rounded-lg shadow-lg text-sm"
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
        ref={(el) => (tooltipContentRefs.current[type] = el)}
      >
        <div className="flex items-start gap-2">
          <FaInfoCircle className="text-[#F9A826] mt-1 flex-shrink-0" />
          <div>
            <p className="font-bold mb-1">{type === 'always-donate' ? 'Always Donate' : 'Campaign-Specific'} Explained:</p>
            <p className="text-xs">
              {type === 'always-donate'
                ? 'Your donation will support the organization regardless of campaign outcome. The organization can use these funds for related initiatives or operational costs.'
                : 'Your donation is exclusively for this campaign. If the campaign doesn\'t reach its goal, you\'ll be eligible for a refund of your donation amount.'}
            </p>
          </div>
        </div>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 text-[#1E293B]">
          <svg width="16" height="8" viewBox="0 0 16 8" fill="currentColor">
            <polygon points="8,0 16,8 0,8" />
          </svg>
        </div>
      </motion.div>,
      document.body
    );
  };

  if (!isOpen) return null;

  const displayName = campaignName || organizationName || "this cause";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000] p-4"
      ref={modalRef}
      onClick={handleBackdropClick}
    >
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

                {/* Completely redesigned toggle */}
                <div className="mt-3 relative">
                  <div className="bg-gray-100 rounded-full p-1 flex items-stretch overflow-hidden">
                    {/* The moving highlight - with much smoother animation */}
                    <div
                      className="absolute top-1 bottom-1 w-1/2 rounded-full bg-[#F9A826] shadow-md transition-transform duration-300 ease-in-out"
                      style={{ transform: `translateX(${donationType === 'one-time' ? '0%' : '100%'})` }}
                    />

                    {/* One-time option */}
                    <button
                      onClick={() => setDonationType('one-time')}
                      className="flex-1 relative z-10 py-3 flex flex-col items-center justify-center rounded-full transition-colors duration-300"
                    >
                      <div className="flex items-center justify-center">
                        <FaMoneyBillWave className={`mr-2 ${donationType === 'one-time' ? 'text-white' : 'text-gray-600'}`} />
                        <span className={`font-medium ${donationType === 'one-time' ? 'text-white' : 'text-gray-600'}`}>
                          One-time
                        </span>
                      </div>
                      <span className={`text-xs ${donationType === 'one-time' ? 'text-white text-opacity-90' : 'text-gray-500'}`}>
                        Single donation
                      </span>
                    </button>

                    {/* Monthly option */}
                    <button
                      onClick={() => setDonationType('monthly')}
                      className="flex-1 relative z-10 py-3 flex flex-col items-center justify-center rounded-full transition-colors duration-300"
                    >
                      <div className="flex items-center justify-center">
                        <FaRegCalendarAlt className={`mr-2 ${donationType === 'monthly' ? 'text-white' : 'text-gray-600'}`} />
                        <span className={`font-medium ${donationType === 'monthly' ? 'text-white' : 'text-gray-600'}`}>
                          Monthly
                        </span>
                      </div>
                      <span className={`text-xs ${donationType === 'monthly' ? 'text-white text-opacity-90' : 'text-gray-500'}`}>
                        Recurring donation
                      </span>
                    </button>
                  </div>
                </div>

                {/* Monthly donation impact animation - always keep the container */}
                <AnimatePresence>
                  {donationType === 'monthly' && (
                    <motion.div
                      ref={monthlyInfoRef}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 overflow-hidden"
                    >
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 relative">
                        <div className="flex items-start">
                          <div className="text-blue-600 mr-2 mt-1">
                            <FaInfoCircle />
                          </div>
                          <div className="w-full">
                            <p className="text-blue-900 font-medium mb-1">Greater Impact with Monthly Giving</p>
                            <p className="text-sm text-blue-700 mb-1">
                              Your recurring donation provides reliable support and helps create lasting change.
                            </p>

                            {/* Content area with animated height for smooth collapse */}
                            <motion.div
                              initial={{ height: 'auto', marginBottom: 0, opacity: 1 }}
                              animate={{
                                height: sectionCollapsed ? 0 : 'auto',
                                marginBottom: sectionCollapsed ? 0 : 8,
                                opacity: sectionCollapsed ? 0 : 1
                              }}
                              transition={{
                                duration: 0.4,
                                ease: "easeInOut"
                              }}
                              className="overflow-hidden"
                            >
                              {/* Impact section with progress bar */}
                              <div
                                ref={impactSectionRef}
                                className={`transition-opacity duration-500 ${progressComplete && heartAnimation !== 'hidden' ? 'opacity-0' : 'opacity-100'}`}
                              >
                                <div className="w-full bg-blue-200 h-1.5 rounded-full mb-2">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.5 }}
                                    className="h-full bg-blue-600 rounded-full"
                                    onAnimationComplete={handleProgressComplete}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-blue-600">
                                  <span>One-time: Single impact</span>
                                  <span>Monthly: Continuous impact</span>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Campaign donation policy - only show for campaign donations - IMPROVED */}
              {campaignId && (
                <div className="mb-6">
                  <h3 className="text-md font-semibold text-[#006838] mb-3 flex items-center">
                    <span className="bg-[#F9A826] text-white w-6 h-6 rounded-full inline-flex items-center justify-center mr-2 text-sm">2</span>
                    Donation Policy
                  </h3>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Always Donate Option */}
                    <div className={`relative rounded-lg transition-all duration-300 overflow-hidden ${selectedDonationPolicy === 'always-donate'
                      ? 'ring-2 ring-[#F9A826] bg-[#FFFAF0]'
                      : 'border border-gray-300 hover:border-[#F9A826]'
                      }`}
                    >
                      {/* Remove the elaborate badge */}

                      <button
                        type="button"
                        className={`absolute top-2 right-2 z-[1000] ${activeTooltip === 'always-donate' ? 'text-[#E68A00]' : 'text-[#F9A826]'
                          } hover:text-[#E68A00] focus:outline-none`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTooltipToggle('always-donate');
                        }}
                        ref={(el) => (tooltipRefs.current['always-donate'] = el)}
                        aria-label="Show more information about Always Donate"
                      >
                        <FaInfoCircle className="text-lg" />
                      </button>

                      {/* Tooltip rendered via portal */}
                      <AnimatePresence>
                        <Tooltip
                          type="always-donate"
                          isVisible={activeTooltip === 'always-donate'}
                        />
                      </AnimatePresence>

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-4 text-left relative"
                        onClick={() => setSelectedDonationPolicy('always-donate')}
                      >
                        <div className="flex items-start">
                          <div className={`w-5 h-5 rounded-full mr-3 mt-0.5 flex items-center justify-center ${selectedDonationPolicy === 'always-donate'
                            ? 'bg-[#F9A826] border-2 border-[#F9A826]'
                            : 'border border-gray-400'
                            }`}
                          >
                            {selectedDonationPolicy === 'always-donate' && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h4 className={`font-bold text-base ${selectedDonationPolicy === 'always-donate' ? 'text-[#F9A826]' : 'text-gray-700'} flex items-center`}>
                              Always Donate
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F9A826] text-white">
                                Recommended
                              </span>
                            </h4>
                            <div className="flex items-center mt-1">
                              <div className={`mr-2 flex-shrink-0 ${selectedDonationPolicy === 'always-donate' ? 'text-[#F9A826]' : 'text-gray-500'}`}>
                                <FaMoneyBillWave />
                              </div>
                              <p className={`text-sm ${selectedDonationPolicy === 'always-donate' ? 'text-gray-700' : 'text-gray-500'}`}>
                                Support the organization regardless of outcome
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    </div>

                    {/* Campaign-Specific Option */}
                    <div className={`relative rounded-lg transition-all duration-300 overflow-hidden ${selectedDonationPolicy === 'campaign-specific'
                      ? 'ring-2 ring-[#F9A826] bg-[#FFFAF0]'
                      : 'border border-gray-300 hover:border-[#F9A826]'
                      }`}
                    >
                      <button
                        type="button"
                        className={`absolute top-2 right-2 z-[1000] ${activeTooltip === 'campaign-specific' ? 'text-[#E68A00]' : 'text-[#F9A826]'
                          } hover:text-[#E68A00] focus:outline-none`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTooltipToggle('campaign-specific');
                        }}
                        ref={(el) => (tooltipRefs.current['campaign-specific'] = el)}
                        aria-label="Show more information about Campaign-Specific"
                      >
                        <FaInfoCircle className="text-lg" />
                      </button>

                      {/* Tooltip rendered via portal */}
                      <AnimatePresence>
                        <Tooltip
                          type="campaign-specific"
                          isVisible={activeTooltip === 'campaign-specific'}
                        />
                      </AnimatePresence>

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        className="w-full p-4 text-left relative"
                        onClick={() => setSelectedDonationPolicy('campaign-specific')}
                      >
                        <div className="flex items-start">
                          <div className={`w-5 h-5 rounded-full mr-3 mt-0.5 flex items-center justify-center ${selectedDonationPolicy === 'campaign-specific'
                            ? 'bg-[#F9A826] border-2 border-[#F9A826]'
                            : 'border border-gray-400'
                            }`}
                          >
                            {selectedDonationPolicy === 'campaign-specific' && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h4 className={`font-bold text-base ${selectedDonationPolicy === 'campaign-specific' ? 'text-[#F9A826]' : 'text-gray-700'}`}>
                              Campaign-Specific
                            </h4>
                            <div className="flex items-center mt-1">
                              <div className={`mr-2 flex-shrink-0 ${selectedDonationPolicy === 'campaign-specific' ? 'text-[#F9A826]' : 'text-gray-500'}`}>
                                <FaHandHoldingHeart />
                              </div>
                              <p className={`text-sm ${selectedDonationPolicy === 'campaign-specific' ? 'text-gray-700' : 'text-gray-500'}`}>
                                Refundable if campaign goal not reached
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {/* Donation Amount */}
              <div>
                <h3 className="text-md font-semibold text-[#006838] mb-2">Donation Amount</h3>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {predefinedAmounts.map((predefinedAmount) => (
                    <motion.button
                      key={predefinedAmount}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAmountSelect(predefinedAmount)}
                      className={`py-2 rounded-lg ${amount === predefinedAmount && !customAmount
                        ? 'bg-[#F9A826] text-white'
                        : 'border border-gray-300 hover:border-[#F9A826] text-gray-700'
                        }`}
                    >
                      RM{predefinedAmount}{donationType === 'monthly' && <span className="text-xs">/month</span>}
                    </motion.button>
                  ))}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
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
                  </motion.button>
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
                        placeholder="Enter amount (min RM10)"
                        autoFocus
                      />
                      {donationType === 'monthly' && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 text-sm">/month</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">Minimum donation amount is RM10</div>
                  </div>
                )}
              </div>

              {/* Add Love Message */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-semibold text-[#006838]">Add a Love Message <span className="text-sm font-normal text-gray-500">(Optional)</span></h3>
                  <button
                    onClick={() => setShowLoveMessage(!showLoveMessage)}
                    className={`text-sm px-3 py-1 rounded flex items-center gap-1 transition-colors ${showLoveMessage ? 'bg-[#F9A826] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {showLoveMessage ? (
                      <>
                        <FaTimes size={12} />
                        <span>Remove</span>
                      </>
                    ) : (
                      <>
                        <FaHeart size={12} />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>

                {showLoveMessage && (
                  <div className="mt-2">
                    <div className="relative">
                      <textarea
                        value={loveMessage}
                        onChange={(e) => setLoveMessage(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#F9A826] focus:border-[#F9A826] min-h-[80px]"
                        placeholder="Share a message of encouragement or why you're supporting this cause..."
                        maxLength={200}
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                        {loveMessage.length}/200
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Add Ethical Investment Consent */}
              <div className="mt-4 bg-green-50 p-3 rounded-lg border border-green-100">
                <label className="flex items-start cursor-pointer">
                  <div className="mt-0.5">
                    <input
                      type="checkbox"
                      checked={ethicalInvestment}
                      onChange={() => setEthicalInvestment(!ethicalInvestment)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded flex items-center justify-center ${
                      ethicalInvestment 
                        ? 'bg-[#006838] text-white' 
                        : 'border border-gray-300 bg-white'
                      }`}
                    >
                      {ethicalInvestment && (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-2 text-sm text-gray-700">
                    Allow my funds to be ethically invested while waiting to be distributed - returns help support more good causes.
                  </span>
                </label>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#006838] mb-2">Donation Summary</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span>Donation to:</span>
                    <span className="font-semibold">{displayName}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Amount:</span>
                    <span className="font-semibold">RM{amount}{donationType === 'monthly' ? '/month' : ''}</span>
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
                  {ethicalInvestment && (
                    <div className="flex justify-between mb-2">
                      <span>Ethical Investment:</span>
                      <span className="font-semibold text-green-600">Enabled</span>
                    </div>
                  )}
                  {showLoveMessage && loveMessage && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="font-semibold mb-1 flex items-center gap-1">
                        <FaHeart className="text-red-500" size={14} />
                        <span>Your Message:</span>
                      </div>
                      <p className="text-sm italic text-gray-700">"{loveMessage}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Credit Card Form (Placeholder) */}
              <div>
                <h3 className="text-lg font-semibold text-[#006838] mb-4">Payment Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#006838] mb-1">Card Holder Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-[#006838] rounded-lg"
                      placeholder="Enter name on card"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#006838] mb-1">Card Number</label>
                    <div className="w-full px-4 py-3 border border-[#006838] rounded-lg bg-white flex items-center">
                      <FaRegCreditCard className="text-[#006838] mr-2" />
                      <span className="text-[#006838]">•••• •••• •••• ••••</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#006838] mb-1">Expiration Date</label>
                      <div className="w-full px-4 py-3 border border-[#006838] rounded-lg bg-white flex items-center">
                        <FaRegCalendarAlt className="text-[#006838] mr-2" />
                        <span className="text-[#006838]">MM / YY</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#006838] mb-1">Security Code</label>
                      <div className="w-full px-4 py-3 border border-[#006838] rounded-lg bg-white flex items-center">
                        <FaLock className="text-[#006838] mr-2" />
                        <span className="text-[#006838]">•••</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center text-sm text-[#006838]">
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
              <h3 className="text-2xl font-bold text-[#006838] mb-2">Thank You for Your Support!</h3>
              <p className="text-gray-700 mb-6">
                Your donation of RM{amount} {donationType === 'monthly' ? 'per month ' : ''}to {displayName} has been processed successfully.
              </p>
              
              {/* Blockchain transaction information */}
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 text-left">
                <div className="flex items-start gap-2">
                  <FaLink className="text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium mb-1">Blockchain Transaction</p>
                    <p className="text-sm text-gray-700 mb-1">
                      Your donation has been recorded on the blockchain for transparency.
                    </p>
                    <div className="mt-2">
                      
                      <p className="text-xs text-gray-500 mt-1">
                        Note: It may take a few minutes for the transaction to appear on the blockchain.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {showLoveMessage && loveMessage && (
                <div className="bg-pink-50 border border-pink-200 p-4 rounded-lg mb-6">
                  <div className="flex items-start gap-2">
                    <FaHeart className="text-pink-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-left mb-1">Your Message:</p>
                      <p className="text-gray-700 text-left italic">"{loveMessage}"</p>
                    </div>
                  </div>
                </div>
              )}
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

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleNextStep}
            disabled={(step === 'amount' && (!amount || !ethicalInvestment)) || isProcessing}
            className={`px-6 py-2 rounded-lg ${(step === 'amount' && (!amount || !ethicalInvestment)) || isProcessing
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
          </motion.button>
        </div>
      </div>

      {/* Auto donation info modal */}
      {showAutodonationInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001] p-4" onClick={handleBackdropClick}>
          <div className="bg-[#006838] rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMoneyBillWave className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-white">Monthly Donation Set Up!</h3>
              <p className="text-white mt-2">
                Your monthly donation of RM{amount} to {displayName} has been set up successfully.
              </p>
            </div>

            <div className="bg-[#006838] p-4 rounded-lg mb-4">
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
                className="px-4 py-2 bg-[#F9A826] text-white rounded-lg shadow-md hover:bg-opacity-90 transition-all"
              >
                Go to Auto Donations
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Heart animation overlay - fixed position to fly across the screen */}
      <AnimatePresence>
        {heartAnimation !== 'hidden' && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-[9999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute text-5xl text-red-500 filter drop-shadow-lg"
              style={{
                left: heartPosition.left,
                top: heartPosition.top,
                marginLeft: '-0.75rem',
                marginTop: '-0.75rem'
              }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={
                heartAnimation === 'flying'
                  ? {
                    y: -300,
                    x: [0, -30, 30, -15, 15, 0],
                    opacity: [1, 1, 0.8, 0.5, 0.2, 0],
                    scale: [1.2, 1.5, 1.2, 0.8, 0.5],
                    rotate: [0, -15, 15, -7, 7, 0],
                  }
                  : {
                    opacity: 1,
                    scale: 1.2,
                    y: 0,
                    x: 0
                  }
              }
              transition={
                heartAnimation === 'flying'
                  ? {
                    duration: 1.5,
                    ease: "easeOut",
                    times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                  }
                  : {
                    duration: 0.3
                  }
              }
            >
              <FaHeart />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DonationModal; 