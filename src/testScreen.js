import {currentUserId} from "./managers/CurrentUser"
import type {Item} from "./types"
import CategorySearchScreen from "./ui/screens/categorySearch"

export const homeScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.HomeScreen',
    },
    passProps: {
        userId: "662a61d0-5473-4d09-9410-c63aadc12e6c"
    }
};


export const networkScreen = {
    screen: {
        screen: 'goodsh.NetworkScreen',
        title: 'Test goodsh.NetworkScreen',
    },
};

export const activityDetail3 = {
    screen: {
        screen: 'goodsh.ActivityDetailScreen',
    },
    passProps: {
        activityId: "cc1dcde2-70f2-4001-9519-f767dd8bfea6",
        activityType: "savings"
    }
};

export const mySavingDetail = {
    screen: {
        screen: 'goodsh.ActivityDetailScreen',
    },
    passProps: {
        activityId: "5e309d3e-bc4e-4de3-9da2-2795a24d615b",
        activityType: "savings"
    }
};

export const dragonBallZSending = {
    screen: {
        screen: 'goodsh.ActivityDetailScreen',
    },
    passProps: {
        activityId: "f5c41253-7ab4-4311-bf6a-d7d62ca33fab",
        activityType: "sendings"
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
        screen: 'goodsh.CommentsScreen',
    },
    passProps: {
        activityId: "5a51497b-61ed-4257-826f-52f6cfeb7b51",
        activityType: "Ask",
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
        // lineupId: 'c460d35f-e78c-410e-810c-27a7f198e28d',
        lineupId: '37e67b05-c86c-4aeb-b3af-bf1c34862cd0',
        // lineupId: 'bffaf43b-f32c-424d-bae2-10cdc12fd192', //a benoit
    }
};

export const networkSearchScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.NetworkSearchScreen',
        title: 'Test network search',
    },
    passProps: {
        token: "films"
    }
};

export const SearchItems = {
    screen: {
        screen: 'goodsh.SearchItems',
        title: 'Test SearchItems',
    },
    passProps: {
        onItemSelected: (item: Item, navigator: RNNNavigator) => {

            navigator.showModal({
                screen: 'goodsh.AddItemScreen',
                title: i18n.t("add_item_screen.title"),
                animationType: 'none',
                passProps: {
                    token: 'h',
                    itemId: item.id,
                    itemType: item.type,
                    item,
                },
            });

        },
    }
};


export const homeSearchItemsScreen = {
    screen: {
        screen: 'goodsh.HomeSearchScreen',
        title: 'Test goodsh.HomeSearchScreen',
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
export const moveInScreen = {
    screen: {
        screen: 'goodsh.MoveInScreen',
    },
    passProps: {
        savingId: "ff4efcaf-19f4-49f1-9525-d49b42dc0803",
    },
}
export const editUserProfileScreen = {
    screen: {
        screen: 'goodsh.EditUserProfileScreen',
    },
    passProps: {
        user: {
            id: "662a61d0-5473-4d09-9410-c63aadc12e6c",
            firstName: "Quentin",
            lastName: "Gaultier"
        }
    },
}

export const myInterests = {
    screen: {
        screen: 'goodsh.MyInterestsScreen',
    },
    // passProps: {
    //     savingId: "ff4efcaf-19f4-49f1-9525-d49b42dc0803",
    // },
}

export const myGoodshs = {
    screen: {
        screen: 'goodsh.MyGoodshsScreen',
    },
    passProps: {
        userId: "662a61d0-5473-4d09-9410-c63aadc12e6c",
    },
}

export const editUserProfile = {
    screen: {
        screen: 'goodsh.EditUserProfileScreen',
    },
    passProps: {
        userId: "5c73fe0f-f0c1-40fe-869f-3a00b55e2f1b",
    },
}

export const popularItemsScreen = {
    screen: {
        screen: 'goodsh.PopularItemsScreen',
    },
}
export const userSheetScreen = {
    screen: {
        screen: 'goodsh.UserSheet',
    },
    animationType: 'none',
    passProps: {
        userId: "5c73fe0f-f0c1-40fe-869f-3a00b55e2f1b"
    }
}
export const searchAutoCompleteScreen = {
    screen: {
        screen: 'goodsh.PlacesAutocomplete',
    },
}
export const categorySearch = {
    screen: {
        screen: 'goodsh.CategorySearchScreen',
        title: 'Test goodsh.CategorySearchScreen',
    },
}
export const contacts = {
    screen: {
        screen: 'goodsh.ContactList',
        title: 'Test goodsh.ContactList',
    },
}
export const community = {
    screen: {
        screen: 'goodsh.Community',
        title: 'Test goodsh.Community',

    },
    passProps: {
        initialIndex: 1
    }
}

export const test = {
    screen: {
        label: 'test',
        screen: 'goodsh.TestScreen',

    },
    passProps: {
        itemId: "8ab94a3c-43b2-4e5c-acfb-d4ff268f93b1",
    }
};

