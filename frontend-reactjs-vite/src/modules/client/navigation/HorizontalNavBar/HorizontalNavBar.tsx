import React from "react";
import { Link, NavLink } from "react-router-dom";
import { FaBars, FaHome, FaListAlt, FaUsers, FaUserCircle, FaComments } from "react-icons/fa";
import LoginButton from "../../../../components/Button/LoginButton";
import logoNameImage from "../../../../assets/images/logo-name.png";
import logoPNGImage from "../../../../assets/images/logo-png.png";
import { useRole } from "../../../../contexts/RoleContext";
import styles from "./HorizontalNavBar.module.css"; // Module CSS Import

interface NavbarProps {
  toggle: () => void;
}

const HorizontalNavbar: React.FC<NavbarProps> = ({ toggle }) => {
  const { userRole } = useRole();

  // Custom navigation items for charity users
  const charityNavItems = [
    {
      title: "Home",
      link: "/Vhack-2025/charity/home",
      icon: <FaHome />,
    },
    {
      title: "Charity",
      link: "/charity",
      icon: <FaListAlt />,
    },
    {
      title: "Community",
      link: "/community",
      icon: <FaUsers />,
    },
    {
      title: "Vendor",
      link: "/Vhack-2025/charity/vendor-page",
      icon: <FaComments />,
    },
    {
      title: "Profile",
      link: "/Vhack-2025/charity/profile",
      icon: <FaUserCircle />,
    },
  ];

  // Use default navBarItems for other roles
  const defaultNavItems = [
    {
      title: "Home",
      link: "/",
      icon: <FaHome />,
    },
    {
      title: "Charity",
      link: "/charity",
      icon: <FaListAlt />,
    },
    {
      title: "Community",
      link: "/community",
      icon: <FaUsers />,
    },
  ];

  // Select which nav items to use based on role
  const navItems = userRole === 'charity' ? charityNavItems : defaultNavItems;

  return (
    <nav className={styles.nav}>
      <Link to={userRole === 'charity' ? "/Vhack-2025/charity/home" : "/"} className={styles.link}>
        <img src={logoPNGImage} alt="Power Stake Name" className={styles.logoIcon} />
        <img src={logoNameImage} alt="Power Stake Name" className={styles.logoName} />
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
        {userRole === 'donor' && (
          <NavLink
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
            to="/donor/profile"
          >
            My Profile
          </NavLink>
        )}
        {userRole === 'vendor' && (
          <NavLink
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
            to="/vendor/profile"
          >
            Profile
          </NavLink>
        )}
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
