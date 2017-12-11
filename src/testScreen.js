
const homeScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.HomeScreen',
    },
    passProps: {
        userId: "662a61d0-5473-4d09-9410-c63aadc12e6c"
    }
};


const communityScreen = {
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

const activityDetailScreen = {
    screen: {
        screen: 'goodsh.ActivityDetailScreen',
    },
    passProps: {
        activityId: "8ade128e-68b1-4674-8da5-309b579b5e1a",
        activityType: "savings"
    }
};

const commentsScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.CommentsScreen',
    },
    passProps: {
        activityId: "dfa4b934-d1f7-43fb-b3ca-893e76658c14",
        activityType: "savings",
    }
};

const profileScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.ProfileScreen',
    },
    passProps: {
        userId: "662a61d0-5473-4d09-9410-c63aadc12e6c"
    }
};

const sendScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.SendScreen',
    },
    passProps: {
        itemId: "8ab94a3c-43b2-4e5c-acfb-d4ff268f93b1",
    }
};
const interactionsScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.InteractionScreen',
    },
    passProps: {
    }
};

const userScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.UserScreen',
    },
    passProps: {
        userId: "b871ecdf-f15c-43bf-b94f-abcbaab637ba",
    }
};

const addItemScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.AddItemScreen',
    },
    passProps: {
        itemId: 'ca2a01a0-6431-4704-aef2-0c6b493b6957',
        itemType: 'CreativeWork',
        defaultLineupId: null
    }
};

// const addItemScreen2 = {
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
const lineupScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.LineupScreen',
    },
    passProps: {
        lineupId: 'cd8b06aa-3c56-4231-80b6-55c39001559a',
        // lineupId: '37e67b05-c86c-4aeb-b3af-bf1c34862cd0',
    }
};

const networkSearchScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.NetworkSearchScreen',
        title: 'Test network search',
    },
};

const searchItemsScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.SearchItemsScreen',
        title: 'Test SearchItemsScreen',
    },
};

const homeSearchItemsScreen = {
    screen: {
        screen: 'goodsh.HomeSearchScreen',
        title: 'Test goodsh.HomeSearchScreen',
    },
};
const networkScreen = {
    screen: {
        screen: 'goodsh.NetworkScreen',
        title: 'Test goodsh.NetworkScreen',
    },
};


const test = {
    screen: {
        label: 'test',
        screen: 'goodsh.TestScreen',

    },
    passProps: {
        itemId: "8ab94a3c-43b2-4e5c-acfb-d4ff268f93b1",
    }
};

let testScreen = null;

//change this line

//  testScreen = test;
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
 testScreen = networkScreen;
//  testScreen = lineupScreen;
//  testScreen = activityDetailScreen;

export default testScreen;