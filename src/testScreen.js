import {currentUserId} from "./managers/CurrentUser";

export const homeScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.HomeScreen',
    },
    passProps: {
        userId: "662a61d0-5473-4d09-9410-c63aadc12e6c"
    }
};


export const communityScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.CommunityScreen',
    },
    passProps: {
        // item: {
        //     id: "8ab94a3c-43b2-4e5c-acfb-d4ff268f93b1",
        //     title: "test_title",
        //     url: "test_url"
        // },

        userId: "662a61d0-5473-4d09-9410-c63aadc12e6c"
    }
};

export const sendingDetail = {
    screen: {
        screen: 'goodsh.ActivityDetailScreen',
    },
    passProps: {
        activityId: "f5c41253-7ab4-4311-bf6a-d7d62ca33fab",
        activityType: "sendings"
    }
};

export const savingDetail = {
    screen: {
        screen: 'goodsh.ActivityDetailScreen',
    },
    passProps: {
        activityId: "c36bc6e3-1425-40af-a1d9-8e31c2dc2a69",
        activityType: "savings"
    }
};

export const ebauchoirDetail = {
    screen: {
        screen: 'goodsh.ActivityDetailScreen',
    },
    passProps: {
        activityId: "ea9a9d93-3818-473d-b9d2-833b5dc17c7f",
        activityType: "savings"
    }
};

//1 comment
export const commentsScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.CommentsScreen',
    },
    passProps: {
        activityId: "381138c4-a988-4209-b9b0-285b62a11a43",
        activityType: "savings",
    }
};

//many comments
export const commentsScreen2 = {
    screen: {
        label: 'test',
        screen: 'goodsh.CommentsScreen',
    },
    passProps: {
        activityId: "e0574190-b0c3-4aed-b451-4ae73187db3d",
        activityType: "sendings",
    }
};

export const profileScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.ProfileScreen',
    },
    passProps: {
        userId: "662a61d0-5473-4d09-9410-c63aadc12e6c"
    }
};

export const sendScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.SendScreen',
    },
    passProps: {
        itemId: "8ab94a3c-43b2-4e5c-acfb-d4ff268f93b1",
    }
};
export const interactionsScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.InteractionScreen',
    },
    passProps: {
    }
};

export const userScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.UserScreen',
    },
    passProps: {
        userId: "b871ecdf-f15c-43bf-b94f-abcbaab637ba",
    }
};

export const addItemScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.AddItemScreen',
    },
    passProps: {
        itemId: 'ca2a01a0-6431-4704-aef2-0c6b493b6957',
        itemType: 'CreativeWork',
        defaultLineupId: "37e67b05-c86c-4aeb-b3af-bf1c34862cd0"
    }
};

// export const addItemScreen2 = {
//     screen: {
//         label: 'test',
//         screen: 'goodsh.AddItemScreen',
//     },
//     passProps: {
//         itemId: 'ca2a01a0-6431-4704-aef2-0c6b493b6957',
//         itemType: 'CreativeWork',
//         defaultLineupId: '37e67b05-c86c-4aeb-b3af-bf1c34862cd0'
//     }
// };
export const lineupScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.LineupScreen',
    },
    passProps: {
        lineupId: 'c460d35f-e78c-410e-810c-27a7f198e28d',
        // lineupId: '37e67b05-c86c-4aeb-b3af-bf1c34862cd0',
    }
};

export const networkSearchScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.NetworkSearchScreen',
        title: 'Test network search',
    },
};

export const searchItemsScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.SearchItemsScreen',
        title: 'Test SearchItemsScreen',
    },
};

export const homeSearchItemsScreen = {
    screen: {
        screen: 'goodsh.HomeSearchScreen',
        title: 'Test goodsh.HomeSearchScreen',
    },
};
export const networkScreen = {
    screen: {
        screen: 'goodsh.NetworkScreen',
        title: 'Test goodsh.NetworkScreen',
    },
};

export const loginScreen = {
    screen: {
        screen: 'goodsh.LoginScreen',
    },
    passProps: {
        initialIndex: 0,
    }
};
export const friendScreen = {
    screen: {
        screen: 'goodsh.FriendsScreen',
    },
    passProps: {
        userId: currentUserId()
    }
};


export const test = {
    screen: {
        label: 'test',
        screen: 'goodsh.TestScreen',

    },
    passProps: {
        itemId: "8ab94a3c-43b2-4e5c-acfb-d4ff268f93b1",
    }
};

//change this line

 // testScreen = test;
// testScreen = profileScreen;
// testScreen = commentsScreen;
// testScreen = communityScreen;
//  testScreen = sendScreen;
//  testScreen = homeScreen;
//  testScreen = interactionsScreen;
//  testScreen = userScreen;
//  testScreen = addItemScreen;
 // testScreen = addItemScreen2;
// testScreen = networkSearchScreen;
//  testScreen = searchItemsScreen;
//  testScreen = homeSearchItemsScreen;
//  testScreen = networkScreen;
//  testScreen = lineupScreen;
//  testScreen = activityDetailScreen;
//  testScreen = loginScreen;
//  testScreen = friendScreen;
