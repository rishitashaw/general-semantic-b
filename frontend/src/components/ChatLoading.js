import { Stack } from "@chakra-ui/layout";
import { Skeleton } from "@chakra-ui/skeleton";

const ChatLoading = () => {
  return (
    <Stack>
      <Skeleton startColor='gray.700' endColor='gray.500' height="50px" borderRadius='xl' />
      <Skeleton startColor='gray.700' endColor='gray.500' height="50px" borderRadius='xl' />
      <Skeleton startColor='gray.700' endColor='gray.500' height="50px" borderRadius='xl' />
      <Skeleton startColor='gray.700' endColor='gray.500' height="50px" borderRadius='xl' />
      <Skeleton startColor='gray.700' endColor='gray.500' height="50px" borderRadius='xl' />
      <Skeleton startColor='gray.700' endColor='gray.500' height="50px" borderRadius='xl' />
      <Skeleton startColor='gray.700' endColor='gray.500' height="50px" borderRadius='xl' />
      <Skeleton startColor='gray.700' endColor='gray.500' height="50px" borderRadius='xl' />
      <Skeleton startColor='gray.700' endColor='gray.500' height="50px" borderRadius='xl' />
      <Skeleton startColor='gray.700' endColor='gray.500' height="50px" borderRadius='xl' />
      <Skeleton startColor='gray.700' endColor='gray.500' height="50px" borderRadius='xl' />
      <Skeleton startColor='gray.700' endColor='gray.500' height="50px" borderRadius='xl' />
    </Stack>
  );
};

export default ChatLoading;
