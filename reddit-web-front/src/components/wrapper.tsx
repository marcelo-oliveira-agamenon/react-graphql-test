import React from "react";
import { Box } from "@chakra-ui/core";

interface wrapperProps {
  variant?: "small" | "regular";
}

const Wrapper: React.FC<wrapperProps> = ({ children, variant = "regular" }) => {
  return (
    <Box
      maxW={variant === "regular" ? "800px" : "400px"}
      w="100%"
      mt={8}
      mx="auto"
    >
      {children}
    </Box>
  );
};

export default Wrapper;
