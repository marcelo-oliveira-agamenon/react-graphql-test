import React from "react";
import { Box, Link } from "@chakra-ui/core";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  return (
    <Box bg="tomato" p={4} ml={"auto"}>
      <Box ml={"auto"}>
        <Link mr={2}>login</Link>
        <Link>register</Link>
      </Box>
    </Box>
  );
};

export default NavBar;
