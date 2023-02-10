import { AddIcon } from "@chakra-ui/icons";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { IconButton, Button } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import UserAvatar from "./userAvatar/UserAvatar";
import GroupAvatar from "./userAvatar/GroupAvatar";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = async () => {
    // console.log(user.token);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${ user.token }`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      setChats(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
    // eslint-disable-next-line
  }, [fetchAgain]);

  return (
    <Box
      d={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="#282D3E"
      color="#fff"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
    // borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "20px", md: "22px" }}
        fontFamily="Work sans"
        fontWeight="bold"
        d="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        10,201 Coins
        <Button
          d="flex"
          fontSize={{ base: "17px", md: "10px", lg: "17px" }}
          colorScheme="yellow"
          borderRadius='xl'

        >Find a Stranger</Button>
        <GroupChatModal>
          <IconButton
            d="flex"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            icon={<AddIcon />}
            colorScheme="blue"
            borderRadius='xl'

          />

        </GroupChatModal>
      </Box>
      <Box
        d="flex"
        flexDir="column"
        p={3}
        bg="#282d3e"
        w="100%"
        h="100%"
        borderRadius="2xl"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? "#242933" : "#282D3E"}
                color={selectedChat === chat ? "white" : "black"}
                px={5}
                py={2}
                borderRadius="lg"
                key={chat._id}
                d='flex'
              // justifyContent={{ base: 'space-between' }}
              >
                {!chat.isGroupChat
                  ?
                  <UserAvatar user={getSenderFull(loggedUser, chat.users)} size={'md'} />
                  :
                  <GroupAvatar size={'sm'} maxObj={2} />
                }
                <Stack ml='10px' spacing={0}>
                  <Text color="white">
                    {!chat.isGroupChat
                      ?
                      <>{getSender(loggedUser, chat.users)}</>
                      :
                      <>#&nbsp;{chat.chatName}</>
                    }
                  </Text>
                  {chat.latestMessage && (
                    <Text fontSize="xs" color="gray.200">
                      <b>{chat.latestMessage.sender.name} : </b>
                      {chat.latestMessage.content.length > 50
                        ? chat.latestMessage.content.substring(0, 51) + "..."
                        : chat.latestMessage.content}
                    </Text>
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
