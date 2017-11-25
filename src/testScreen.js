
const homeScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.HomeScreen',
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

const commentsScreen = {
    screen: {
        label: 'test',
        screen: 'goodsh.CommentsScreen',
    },
    passProps: {
        activityId: "9f2cdcbd-4ff0-47d1-be11-c4b586a75cab",
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

let testScreen = null;

//change this line
//testScreen = profileScreen;
// testScreen = commentsScreen;
// testScreen = communityScreen;


export default testScreen;