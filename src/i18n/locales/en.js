export default {
    app : {
        update: {
            title: "Update",
            label : "Updating your app, please be patient..."
        }
    },
    "tabs": {
        home: {
            title: "My lists"
        },
        network: {
            title: "News feed"
        }
    },
    lineups: {
        search: {
            placeholder: "##Search",
            empty: "No result",
        },
        filter: {
            empty: "No result. Try launching a deep search.",
            deepsearch: "Deep search",
        },
        goodsh : {
            title: "GoodshBox"
        },
        mine : {
            title: "My lists"
        },
        others: {
            title: "Other lists"
        },
        empty_screen: "All your goodsh in one place.\nTap '+' to save a new one."
    },
    no_spam: {
        dialog_title: "The 3 pillars of Goodsh",
        dialog_body: "- Your goodsh are **ONLY** visible by you and your friends\n\n" +
        "- When you save a goodsh, we **DON'T** notify your contacts\n\n" +
        "- For a fully private goodsh, tap the lock\n\n",
        dialog_button: 'OK',
    },
    tips: {
        visibility: {
            title: "Visibility",
            text: "Your goodsh are only visible by you and your friends",
            button: "OK"
        },
        noise: {
            title: "Notification",
            text: "When you save a goodsh, we don't notify your contacts",
            button: "OK"
        },
        full_private: {
            title: "Privacy",
            text: "For a fully private goodsh, tap the lock",
            button: "OK"
        },
    },
    home: {
        wizard: {
            action_button_label : "Add a coup de coeur\nor a wish.",
            action_button_body : "Book, movie, tvshow, restaurant, music...",
        },
        tabs: {
            my_goodsh: "MY GOODSH",
            my_interests: "LINEUP",
        }
    },
    search:{
        in_items: "What would you like to save?",
        in_network: "Search in my network",
        in_feed: "Search",
        by: "by",
    },
    "shared":{
        "goodsh_saved":"Saved",
        "add":"Add",
        "link_copied":"Link copied ✓",
    },
    "activity_item":{
        header: {
            in: "%{adder} added %{what} in %{lineup}",
            added_somewhere: "added it",
            to: "%{from} sent %{what} to %{to}",
            ask: "%{asker} needs some tips!",
        },
        buttons:{
            "comment": {
                zero: "COMMENT",
                one: "COMMENT (1)",
                other: "COMMENT (%{count})"
            },

            "share":"SEND THE LINK",
            "save":"SAVE",
            "unsave":"DELETE",
            "see":"VIEW",
            "buy":"BUY",
            "answer": {
                zero: "ANSWER",
                one: "ANSWER (1)",
                other: "ANSWER (%{count})"
            },
            "follow_list": "FOLLOW LIST",
            "unfollow_list": "UNFOLLOW LIST",
            "modified_list": "List renamed",
            "deleted_list": "List deleted"
        }
    },
    "activity_screen":{
        "comments":{
            "no_comments":"Any idea? Suggestion? Question?",
            "user_answered":"replied",
            "has_commented": {
                zero: "%{first} commented",
                one: "%{first} and %{second} commented",
                other: "%{first} and %{count} more commented"
            },
            "has_commented_this": {
                zero: "%{first} commented",
                one: "%{first} et %{second} commented",
                other: "%{first} et %{count} more commented"
            },
            "has_commented_this_as_well": {
                zero: "%{first} commented also",
                one: "%{first} et %{second} commented also",
                other: "%{first} et %{count} more commented also"
            },
            "see_theirs_comments": {
                zero: "See their comments.",
                one: "See their comments.",
                other: "See their comments."
            }
        }
    },
    "login_screen":{
        "facebook_signin":"SIGN IN WITH FACEBOOK",
        "no_publication":"Goodsh does not post anything on Facebook.",
        "account_kit_signin":"Sign in without Facebook",
        "definition":{
            "example":"##Bouquin, restaurant, film, série, artiste,lieu, musique, gadget, fringue, vin, …"
        },
        "value_proposal":"##I was said it is\n" +"very good.\n" + "Not to forget it\n" + "I stored it\n" + "in",
        "slider_intro_1": "Don't forget your friends' tips,\ngoodsh them.",
        "slider_intro_2": "Find your stuff whenever you need them, and share easily.",
        "slider_intro_3": "Request ideas, suggestions, reviews from your network.",
        "slider_intro_4": "Discover books, movies, music, restaurants, gift ideas, things to do, to visit...and buy in a blink of an eye.",
        "credentials": "Handcrafted in 2018",
    },
    "profile_screen":{
        "title":"Feedback",
        "subtitle":"##Is this what you've been dreaming of? How good do you feel? What's badly missing? We can't wait to know…"
    },
    "detail_screen":{
        "related_activities_title": "Related activities"
    },
    "create_list_controller":{
        "title":"+ Add new",
        "subtitle":"##Be creative;)",
        "placeholder":"Be creative;)",
        "action":"Add new list",
        "created":"New list added",
        "visible":"Visible by network",
        "unvisible":"Visible only by me",
        "add_description":"Add a note",
        "choose_list":"Choose a list",
        "choose_another_list":"Choose another list",
        "all_list": "All my lists",
        "add_to_list": "Add to"
    },
    "search_bar":{
        "me_placeholder":"##Search in your lists",
        "network_placeholder":"##Browse your network"
    },
    "network_search_tabs":{
        "savings":"GOODSH & LIST",
        "users":"MEMBER"
    },
    "community_screen":{
        "tabs": {
            "friends":"MY CONTACTS",
            "notifications":"NOTIFICATIONS",
        },
        "empty_screen": "The goodsh of your friends are here.\nInvite them to share your tips with them."
    },
    "comments_screen":{
        "title": "Comments"
    },
    "search_item_screen":{
        "tabs": {
            "consumer_goods":"STUFF",
            "places":"PLACE",
            "movies":"MOVIE",
            "musics":"MUSIC"
        },
        "placeholder": {
            "consumer_goods":"Stuff: books, gifts, shoes, wine, games, products...",
            "places":"Restaurants, cafés, shops, hotels, museums, cities, beaches, places to visit, doctors, plumbers...",
            "movies":"Movies, TV shows",
            "musics":"Musics, ortists, albums, tracks"
        },
        "search_options":  {
            "around_me": "Around me"
        }
    },
    "activity_comments_screen":{
        "add_comment_placeholder":"Reply"
    },
    "send_screen":{
        "add_description_placeholder":"Add a note to %{recipient}",
        "sent": "Sent"
    },
    "interactions":{
        "saving":"saved %{what}",
        "comment":"commented %{what}",
        "comment_ask":"replied on '%{what}'",
        "like":"said YEAAH! to %{what}",
        "list":"created the list %{what}",
        "post":"posted %{what}",
        "sending":"sent %{what} to you",
        "invitation":"Connexion successful with %{you}",
        "you":"you",
        "empty_screen": "If you love it, share it.",
    },
    util: {
        time: {
            since_seconds: "just now",
            since_minutes: {
                zero: "",
                one: "1 minute ago",
                other: "%{count} minutes ago"
            },
            since_hours: {
                zero: "",
                one: "1 hour ago",
                other: "%{count} hours ago"
            },
            since_days: {
                zero: "",
                one: "1 day ago",
                other: "%{count} days ago"
            },
            since_months: {
                zero: "",
                one: "1 month ago",
                other: "%{count} months ago"
            },
            since_years: {
                zero: "",
                one: "1 year ago",
                other: "%{count} years ago"
            },
        }
    },
    loadmore: "Loading",
    send_message: "Send via Goodsh: The bucketlist app to store and never forget a good stuff someone advised me to do.",
    send_object: "recommend you %{what} - via Goodsh",
    goodsh_url: "https:\/\/goodsh.it\/",
    friends: {
        empty_screen: "Fully enjoy Goodsh by inviting your friends.",
        buttons: {
            connect: "Connect",
            disconnect: "Disconnect",
        },
        messages: {
            connect: "connected",
            disconnect: "disconnected",
        },
        alert: {
            title: "Disconnection",
            label: "Are you sure?"
        }
    },
    unsave_screen: {
        unsave_button: {
            idle: "Delete",
            sending: "Deleting...",
            ok: "Deleted",
            ko: "Retry",
        }
    },
    empty: {
        lineup: "This list is empty, add what you love!"
    },
    activity_action_bar: {
        goodsh_deleted: "Goodsh deleted",
        goodsh_deleted_undo: "Undo",
        goodsh_bookmarked: "Goodsh added in %{lineup}",
        goodsh_bookmarked_change_lineup: "Change",
        comment: {
            title: "Comments"
        },
        response: {
            title: "Replies"
        }
    },
    "load_more_activities": {
        zero: "",
        one: "See %{count} more activity",
        other: "See %{count} more activities",
    },
    add_item_screen: {
        title: "Select list"
    },
    home_search_screen: {
        saving: {
            title: "Details",
        },
        community: {
            title: "My network",
        }
    },
    loading: {
        error: "D@#m$%n, loading error."
    },
    actions: {
        ok: "Ok",
        add: "Add",
        delete: "Delete",
        change: "Change",
        change_title: "Change title",
        edit_saving_menu: "Edit this goodsh",
        share_list: "Share this list",
        change_description: "Change the description",
        move: "Change list",
        change_name: "Rename this list",
        undo: "Undo",
        cancel: "Cancel",
        buy: "Buy",
        send: "Send",
        create: "Create",
        try_again: "Try Again",
        ask_friend: "Ask my network",
        logout: "Logout",
        follow: "Follow",
        unfollow: "Unfollow",
        terms: "Terms and personal data",
        copy_link: "Copy link",
        send_to_goodsher: "Send to another\nuser",
        skip: "OK",
        ask: "Ask my network",
        ask_button: "Ask",
        invite: "Invite a friend",
        load_more: "Load more",
        unsave: "Delete",
        save: "Save",
    },
    common: {
        empty_feed_generic: "If you love it, share it.\nWhy don't you invite some friends to goodsh?",
        api: {
            generic_error: "Oops... Problem with the internet."
        }
    },
    ask: {
        sent: "Request sent",
        cancel: "Cancel the request ?",
        minimal_length: "The question must be at least 10 characters."

    },
    share_goodsh: {
        title: "Come goodsh with me",
        message: "Join me on Goodsh: https://goodsh.it/"
    },
    alert: {
        delete: {
            title: "Delete",
            label: "Are you sure?"
        },
        position: {
            title: "Places around me",
            message: "To find the places around you, activate your location",
            button: "Activate"
        }
    },
    dev: {
        label: "Dev mode",
        title: "DevMenu"
    },
    congrats: {
        generic: "Done;)"
    },
    errors: {
        unavailable: 'Content not available',
    }
};
