import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/avatar";
import { useHistory } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const {
    setSelectedChat,
    user,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${ user.token }`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${ search }`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    console.log(userId);

    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${ user.token }`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <div style={{ background: '#282d3e' }}>
      <Box
        d="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="#282D3E"
        color="#fff"
        w="100%"
        p="10px"
        borderWidth="5px"
        borderColor="#282d3e"
        borderRadius="2xl"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button
            borderRadius='xl'
            variant='outline'
            onClick={onOpen}
            bg='#282d3e'
            borderWidth='lg'
            borderColor='gray.600'
            _hover={{ bg: '#282d3e' }}
            // _hover={{ bg: '#ebedf0' }}
            _active={{
              // bgGradient: 'linear(to-r, teal.500, green.500)',
              transform: 'scale(0.98)',

            }}>
            <Text
              d={{ base: "none", md: "flex" }}
              px={4}
              textAlign='left'
              fontWeight='thin'
              color='gray.200'
            >
              Search User...
            </Text>
            <i className="fas fa-search"
            ></i>
          </Button>
        </Tooltip>
        <Text fontSize="lg" fontWeight="bold" fontFamily="Work sans">
          General Semantic
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notification.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList
              pl={2}
              bg="#242933"
              color="#fff"
              borderColor='gray.600'
            >
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${ notif.chat.chatName }`
                    : `New Message from ${ getSender(user, notif.chat.users) }`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={Button}
              borderWidth='lg'
              borderColor='gray.600'
              bg='#282d3e'
              _hover={{ bg: '#282d3e' }}
              // _hover={{ bg: '#ebedf0' }}
              _active={{
                // bgGradient: 'linear(to-r, teal.500, green.500)',
                transform: 'scale(0.98)',
              }}
              rightIcon={<ChevronDownIcon />}
              borderRadius='xl'
            >
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList
              bg="#242933"
              color="#fff"
              _hover={{
                bg: "#242933"
              }}
              _active={{
                bg: "000"
              }}
              _focus={{
                bg: "#242933"

              }}
              borderColor='gray.600'
            >
              <ProfileModal user={user}>
                <MenuItem bg="#242933"
                  borderColor='gray.600'
                  color="#fff"
                  _hover={{
                    bg: "#242933"
                  }}
                  _active={{
                    bg: "000"
                  }}
                  _focus={{
                    bg: "#242933"

                  }}
                >My Profile</MenuItem>{" "}
              </ProfileModal>
              <MenuDivider />
              <MenuItem bg="#242933"
                borderColor='gray.600'
                color="#fff"
                _hover={{
                  bg: "#242933"
                }} onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg="#282d3e" color="#fff">
          <DrawerHeader borderBottomWidth="1px" borderColor='gray.600'>Search Users</DrawerHeader>
          <DrawerBody>
            <Box d="flex" pb={2}>
              <Input
                borderColor='gray.600'
                width={"100 %"}
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch} bgGradient='linear(to-l, #7928CA, #FF0080)'
                _hover={{ bgGradient: 'linear(to-l, #FF0080, #7928CA)' }}
                // _hover={{ bg: '#ebedf0' }}
                _active={{
                  bgGradient: 'linear(to-r, teal.500, green.500)',
                  transform: 'scale(0.98)',
                  borderColor: '#bec3c9',
                }}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" d="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div >
  );
}

export default SideDrawer;
