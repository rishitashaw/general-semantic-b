import { Avatar } from '@chakra-ui/react';
import React from 'react';

export default function UserAvatar({ user, size }) {
    return (
        <Avatar
            size={size}
            src={user.pic}
            name={user.name}
        />
    );
}
