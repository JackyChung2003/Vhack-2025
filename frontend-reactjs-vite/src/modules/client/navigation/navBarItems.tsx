import { FaHome, FaListAlt, FaVideo, FaUsers, FaUser } from "react-icons/fa";

const navBarItems = [
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
    title: "Scan QR",
    link: "/scan",
  },
  {
    title: "Community",
    link: "/community",
    icon: <FaUsers />,
  },
  {
    title: "Profile",
    link: "/profile",
    icon: <FaUser />,
  },
];

export default navBarItems;