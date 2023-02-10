import { Avatar, AvatarGroup } from '@chakra-ui/react'
import React from 'react'
import { ChatState } from '../../Context/ChatProvider';

function GroupAvatar({ size, maxObj }) {
    const { selectedChat } = ChatState();

    return (
        <AvatarGroup size={size} max={maxObj} >
            {selectedChat?.users.map((u) => (
                <Avatar
                    key={u._id}
                    name={u.name}
                    src={u.pic}
                />
            ))}
        </AvatarGroup>
    )
}

export default GroupAvatar