import React, { useEffect } from 'react';
import { useRole } from '../../../../contexts/RoleContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaHandHoldingHeart, FaBuilding, FaShoppingCart, FaChartLine, FaShieldAlt, FaGlobe, FaArrowRight } from 'react-icons/fa';
import ThemeToggle from '../../../../components/Button/ThemeToggleButton';
import LoginButton from '../../../../components/Button/LoginButton';

const LandingPage = () => {
    const { userRole, isLoading } = useRole();  // Added `isLoading` for better role checking
    const navigate = useNavigate();
    
    // Redirect users to their specific home pages based on role
    useEffect(() => {
        if (!isLoading) {
            if (userRole === 'charity') {
                navigate('/Vhack-2025/charity/home');
            } else if (userRole === 'vendor') {
                navigate('/Vhack-2025/vendor/dashboard');
            }
        }
    }, [userRole, isLoading, navigate]);

    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Hero Section - Enhanced with animated elements */}
            <section className="relative bg-gradient-to-r from-[var(--highlight)] to-[var(--secondary)] py-24 overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>
                
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg animate-fadeIn">
                        Transparent Giving, Verified Impact
                    </h1>
                    <p className="text-xl md:text-2xl text-white text-opacity-90 mb-10 max-w-3xl mx-auto leading-relaxed animate-fadeIn animation-delay-200">
                        A blockchain-powered platform connecting donors directly with verified charities and transparent fund management
                    </p>
                    <div className="flex flex-col sm:flex-row gap-5 justify-center animate-fadeIn animation-delay-400">
                        <button className="px-8 py-4 bg-white text-[var(--highlight)] rounded-lg font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                            Get Started <FaArrowRight />
                        </button>
                        <Link to="/charity" className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:bg-opacity-20 transition-all transform hover:scale-105">
                            Explore Campaigns
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-[var(--main)] py-6 shadow-md border-b border-[var(--stroke)]">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div className="p-4">
                            <p className="text-3xl font-bold text-[var(--highlight)]">$2.5M+</p>
                            <p className="text-[var(--paragraph)]">Total Raised</p>
                        </div>
                        <div className="p-4">
                            <p className="text-3xl font-bold text-[var(--highlight)]">150+</p>
                            <p className="text-[var(--paragraph)]">Active Campaigns</p>
                        </div>
                        <div className="p-4">
                            <p className="text-3xl font-bold text-[var(--highlight)]">5,000+</p>
                            <p className="text-[var(--paragraph)]">Donors</p>
                        </div>
                        <div className="p-4">
                            <p className="text-3xl font-bold text-[var(--highlight)]">100%</p>
                            <p className="text-[var(--paragraph)]">Transparent</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works - Enhanced with animations and better spacing */}
            <section className="py-20 px-6 bg-gradient-to-b from-[var(--background)] to-[var(--main)] bg-opacity-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-[var(--headline)] mb-4">How It Works</h2>
                        <div className="w-24 h-1 bg-[var(--highlight)] mx-auto rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <FeatureCard 
                            icon={<FaHandHoldingHeart className="text-[var(--highlight)] text-5xl" />}
                            title="Donors"
                            description="Support causes you care about with transparent tracking of your contributions and their impact."
                            delay="0"
                        />
                        <FeatureCard 
                            icon={<FaBuilding className="text-[var(--secondary)] text-5xl" />}
                            title="Charities"
                            description="Create campaigns, manage funds, and demonstrate impact with blockchain-verified transparency."
                            delay="200"
                        />
                        <FeatureCard 
                            icon={<FaShoppingCart className="text-[var(--tertiary)] text-5xl" />}
                            title="Vendors"
                            description="Provide goods and services to charities with streamlined quotations and verified transactions."
                            delay="400"
                        />
                    </div>
                </div>
            </section>

            {/* Key Benefits - Enhanced with better visual hierarchy */}
            <section className="py-20 px-6 bg-[var(--main)]">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-[var(--headline)] mb-4">Why Choose Our Platform</h2>
                        <div className="w-24 h-1 bg-[var(--highlight)] mx-auto rounded-full"></div>
                        <p className="mt-4 text-lg text-[var(--paragraph)] max-w-2xl mx-auto">Our blockchain-based platform ensures every donation is tracked and verified</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <BenefitCard 
                            icon={<FaShieldAlt />}
                            title="Blockchain Security"
                            description="Every transaction is secured and verified on the blockchain, ensuring complete transparency."
                        />
                        <BenefitCard 
                            icon={<FaChartLine />}
                            title="Real-time Impact"
                            description="Track exactly how your donations are being used and the impact they're making."
                        />
                        <BenefitCard 
                            icon={<FaGlobe />}
                            title="Global Community"
                            description="Join a worldwide community of donors and organizations making a difference together."
                        />
                    </div>
                </div>
            </section>

            {/* Featured Campaigns - Enhanced with better card design */}
            <section className="py-20 px-6 bg-gradient-to-b from-[var(--background)] to-[var(--main)] bg-opacity-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-[var(--headline)] mb-4">Featured Campaigns</h2>
                        <div className="w-24 h-1 bg-[var(--highlight)] mx-auto rounded-full"></div>
                        <p className="mt-4 text-lg text-[var(--paragraph)] max-w-2xl mx-auto">Discover some of our current high-impact campaigns</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map(id => (
                            <div key={id} 
                                className="bg-[var(--main)] p-6 rounded-xl shadow-xl border border-[var(--stroke)] hover:shadow-2xl transition-all transform hover:-translate-y-2 overflow-hidden cursor-pointer"
                                onClick={() => navigate(`/charity/${id}`)}
                            >
                                <div className="h-40 -mx-6 -mt-6 mb-6 bg-gradient-to-r from-[var(--highlight)] to-[var(--secondary)] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                                    <div className="absolute bottom-0 left-0 p-4">
                                        <span className="bg-white bg-opacity-90 text-[var(--highlight)] px-3 py-1 rounded-full text-sm font-semibold">
                                            {id === 1 ? "Clean Water" : id === 2 ? "Education" : "Healthcare"}
                                        </span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-[var(--headline)] mb-3">
                                    {id === 1 ? "Clean Water Initiative" : id === 2 ? "Education for All" : "Medical Aid Program"}
                                </h3>
                                <p className="mb-5 text-[var(--paragraph)] line-clamp-2">
                                    {id === 1 
                                        ? "Providing clean water to communities in need through sustainable infrastructure." 
                                        : id === 2 
                                            ? "Supporting education programs for underprivileged children worldwide." 
                                            : "Delivering essential medical supplies to underserved regions."}
                                </p>
                                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                    <div className="h-full rounded-full bg-gradient-to-r from-[var(--highlight)] to-[var(--secondary)]" style={{width: `${30 + id * 20}%`}}></div>
                                </div>
                                <div className="flex justify-between text-sm mb-4">
                                    <span>${5000 * id} raised</span>
                                    <span>${10000 * id} goal</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="text-center mt-12">
                        <Link to="/charity" className="px-8 py-4 bg-[var(--highlight)] text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all inline-flex items-center gap-2">
                            View All Campaigns <FaArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Call to Action - Enhanced with better visual design */}
            <section className="py-20 px-6 bg-gradient-to-r from-[var(--secondary)] to-[var(--tertiary)] relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-10 rounded-full -translate-x-1/3 translate-y-1/3"></div>
                
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">Ready to Make a Difference?</h2>
                    <p className="text-xl text-white text-opacity-90 mb-10 max-w-2xl mx-auto">
                        Join our platform today and be part of a transparent, impactful giving community.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        <button className="px-8 py-4 bg-white text-[var(--highlight)] rounded-lg font-semibold hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
                            Get Started <FaArrowRight />
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[var(--main)] py-10 border-t border-[var(--stroke)]">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <p className="text-[var(--paragraph)]">© 2025 Blockchain Charity Platform. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

// Helper components with enhanced styling
const FeatureCard = ({ icon, title, description, delay }: { icon: any, title: any, description: any, delay: string }) => (
    <div className={`text-center p-8 bg-[var(--main)] rounded-xl shadow-xl border border-[var(--stroke)] hover:shadow-2xl transition-all transform hover:-translate-y-2 animate-fadeIn animation-delay-${delay}`}>
        <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-[var(--background)] flex items-center justify-center shadow-lg">
                {icon}
            </div>
        </div>
        <h3 className="text-2xl font-bold text-[var(--headline)] mb-4">{title}</h3>
        <p className="text-[var(--paragraph)] leading-relaxed">{description}</p>
    </div>
);

const BenefitCard = ({ icon, title, description }: { icon: any, title: any, description: any }) => (
    <div className="flex items-start p-6 bg-[var(--background)] rounded-xl shadow-md hover:shadow-xl transition-all">
        <div className="text-[var(--highlight)] text-3xl mr-5 mt-1 bg-[var(--highlight)] bg-opacity-10 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold text-[var(--headline)] mb-3">{title}</h3>
            <p className="text-[var(--paragraph)] leading-relaxed">{description}</p>
        </div>
    </div>
);

export default LandingPage;
