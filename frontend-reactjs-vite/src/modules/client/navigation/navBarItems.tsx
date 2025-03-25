import { FaHome, FaListAlt, FaVideo, FaUsers } from "react-icons/fa";

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
    title: "Community",
    link: "/community",
    icon: <FaUsers />,
  },
];

export default navBarItems;