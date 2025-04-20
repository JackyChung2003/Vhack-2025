import React from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBars, FaHome, FaListAlt, FaUsers, FaUserCircle, FaComments, FaChartLine, FaReceipt } from "react-icons/fa";
import LoginButton from "../../../../components/Button/LoginButton";
import logoNameImage from "../../../../assets/images/logo-name.png";
import logoPNGImage from "../../../../assets/images/logo-png.png";
import { useRole } from "../../../../contexts/RoleContext";
import styles from "./HorizontalNavBar.module.css";

interface NavbarProps {
  toggle: () => void;
}

const HorizontalNavbar: React.FC<NavbarProps> = ({ toggle }) => {
  const { userRole } = useRole();

  // Custom navigation items for charity users (use root-relative paths)
  const charityNavItems = [
    { title: "Home", link: `/charity/home`, icon: <FaHome /> },
    { title: "Management", link: `/charity-management`, icon: <FaChartLine /> },
    { title: "Vendor", link: `/charity/vendor-page`, icon: <FaComments /> },
    { title: "Open Market", link: `/charity/open-market`, icon: <FaListAlt /> },
    { title: "Profile", link: `/charity/profile`, icon: <FaUserCircle /> },
  ];

  // Custom navigation items for vendor users (use root-relative paths)
  const vendorNavItems = [
    { title: "Home", link: `/vendor/dashboard`, icon: <FaHome /> },
    { title: "Open Market", link: `/vendor/open-market`, icon: <FaListAlt /> },
    { title: "Order", link: `/vendor/order-management`, icon: <FaReceipt /> },
    { title: "Profile", link: `/vendor/profile`, icon: <FaUserCircle /> },
  ];

  // Custom navigation items for donor users (use root-relative paths)
  const donorNavItems = [
    { title: "Home", link: `/donor-homepage`, icon: <FaHome /> },
    { title: "Charity", link: `/charity`, icon: <FaListAlt /> },
    { title: "Profile", link: `/donor/profile`, icon: <FaUserCircle /> },
  ];

  // Select nav items based on role
  let navItems = donorNavItems; // Default to donor
  // Determine logo link based on role 
  let logoLink = `/`; // Default logo link to public landing page

  if (userRole === 'charity') {
    navItems = charityNavItems;
    // logoLink remains '/'
  } else if (userRole === 'vendor') {
    navItems = vendorNavItems;
    // logoLink remains '/'
  } else if (userRole === 'donor') {
    navItems = donorNavItems;
    logoLink = `/donor-homepage`; // Donors logo links to their specific homepage
  }

  return (
    <nav className={styles.nav}>
      <Link to={logoLink} className={styles.link}>
        <img src={logoPNGImage} alt="DermaNow Logo" className={styles.logoIcon} />
        <span className={styles.logoName}>DermaNow</span>
      </Link>
      <div className={styles.menuItems}>
        {navItems.map((item, index) => (
          <NavLink
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
            to={item.link}
            key={index}
          >
            {item.title}
          </NavLink>
        ))}
      </div>
      <div className={styles.loginButtonMobileHidden}>
        <div className={styles.icons}>
          <a
            href="https://github.com/JackyChung2003/Vhack-2025"
            target="_blank"
            rel="noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`${styles.githubIcon} ${styles.iconTabler}`}
              width="30"
              height="30"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              fill="#000"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"></path>
            </svg>
          </a>
          <div className={styles.mobileMenuIcon}>
            <FaBars onClick={toggle} />
          </div>
          <div className={styles.loginButtonMobileHidden}>
            <LoginButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HorizontalNavbar;
