export default {
    app : {
        update: {
            title: "Mise à jour",
            label : "Mise à jour de Goodsh. Un peu de patience..."
        }
    },
    "tabs": {
        home: {
            title: "Mes goodsh"
        },
        network: {
            title: "Mon réseau"
        }
    },
    lineups: {
        filter: {
            empty: "Pas de résultat, vous pouvez essayer de lancer une recherche approfondie",
            deepsearch: "Recherche approfondie",
        },
        search: {
            placeholder: "##Rechercher"
        },
        goodsh : {
            title: "GoodshBox"
        },
        mine : {
            title: "Mes listes"
        },
        empty_screen: "Retrouve ici tous tes goodsh.\nTap '+' pour en ajouter un."
    },
    no_spam: {
        dialog_title: "Les 3 grands principes de Goodsh",
        dialog_body: "Tes goodsh ne sont visibles QUE par toi et ton réseau.\n\nQuand tu enregistres un goodsh, tes contacts ne sont PAS notifiés. \n\nPour un goodsh COMPLÈTEMENT privé, active le cadenas.",
        dialog_button: 'OK, GO!',
    },
    home: {
        wizard: {
            action_button_label : "Enregistrer un goodsh.",
            action_button_body : "Tap '+' pour ton premier gooodsh.",
        }
    },
    search: {
        in_items: "Saisir le nom à enregistrer",
        in_network: "Rechercher dans mon réseau",
        in_feed: "Rechercher dans mes listes"
    },
    "shared":{
        "goodsh_saved":"Enregistré",
        "add":"Ajouter",
        "link_copied":"Lien copié ✓",
    },
    "activity_item": {
        header: {
            in: "a ajouté dans",
            to: "à",
            ask: "a besoin de recos !",
        },
        buttons:{
            "comment": {
                zero: "DONNER SON AVIS",
                one: "DONNER SON AVIS (1)",
                other: "DONNER SON AVIS (%{count})"
            },
            "share":"ENVOYER LE LIEN",
            "save":"ENREGISTRER",
            "unsave":"SUPPRIMER",
            "see":"VOIR",
            "buy":"ACHETER",
            "answer": {
                zero: "RÉPONDRE",
                one: "RÉPONDRE (1)",
                other: "RÉPONDRE (%{count})"
            },
            "follow_list": "SUIVRE LA LISTE",
            "unfollow_list": "NE PLUS SUIVRE",
            "modified_list": "Liste renommée",
            "deleted_list": "Liste effacée"
        }
    },
    "activity_screen":{
        "comments":{
            "no_comments":"Donner son avis",
            "user_answered":"a commenté",
        }
    },
    "login_screen":{
        "facebook_signin":"SE CONNECTER AVEC FACEBOOK",
        "no_publication":"Goodsh ne publie rien sur Facebook.",
        "definition":{
            "example":"##Bouquin, restaurant, film, série, artiste,\nlieu, musique, gadget, fringue, vin, …"
        },
        "value_proposal":"##Marre d’oublier les recommandations\nqu’on te fait ?",
        "slider_intro_1": "On m'a dit que c’était top.\nPour ne pas l'oublier\nje l’ai goodshé.",
        "slider_intro_2": "Je retrouve mes recos quand j'en ai besoin.\nEt je peux les partager facilement.",
        "slider_intro_3": "Je demande des avis, des idées, des conseils à mon réseau.",
        "slider_intro_4": "Je découvre livres, films, musiques, restos, idées cadeau, choses à faire...et j'achète en un clin d'oeil.",
        "credentials": "Fait avec amour à Paris",
    },
    "profile_screen":{
        "title":"Feedback",
        "subtitle":"##Comment tu la trouves ? Tu la kiffes ? Qu'est-ce qui manque cruellement ? On a très envie de savoir...",
    },
    "create_list_controller":{
        "title":"Nouvelle liste",
        "subtitle":"##Pour y ranger plein de trucs top et les partager si je veux",
        "placeholder":"Sois créatif !",
        "action":"Créer une nouvelle liste",
        "created":"Liste créée",
        "visible":"Visible par mon réseau",
        "unvisible":"Visible que par moi",
        "add_description":"Ajouter un petit mot",
        "choose_list":"Choisir une liste",
        "choose_another_list":"Choisir une autre liste",
        "all_list" : "Toutes mes listes"
    },
    "search_bar":{
        "me_placeholder":"##Rechercher dans mes listes",
        "network_placeholder":"##Rechercher dans mon réseau"
    },
    "network_search_tabs":{
        "savings":"GOODSH & LISTE",
        "users":"CONTACT"
    },
    "community_screen":{
        "tabs": {
            "friends":"MES CONTACTS",
            "notifications":"NOTIFICATIONS",
        },
        "empty_screen": "Découvre ici les goodsh de tes contacts. Tap ASK pour leur poser des questions."
    },
    "comments_screen":{
        "title": "Commentaires"
    },
    "search_item_screen":{
        "tabs": {
            "consumer_goods":"TRUC",
            "places":"LIEU",
            "movies":"FILM",
            "musics":"SON"
        },
        "placeholder": {
            "consumer_goods":"##Plein de trucs",
            "places":"##Plein d'endroits",
            "movies":"##Plein de films",
            "musics":"##Plein de sons"
        },
    },
    "activity_comments_screen":{
        "add_comment_placeholder":"Répondre"
    },
    "send_screen":{
        "add_description_placeholder":"Ajouter un petit mot (visible uniquement par le destinataire)."
    },
    "interactions":{
        "saving":"a enregistré %{what}",
        "comment":"a commenté %{what}",
        "comment_ask":"a répondu à '%{what}'",
        "like":"dit YEAAH! à %{what}",
        "list":"a créé la liste %{what}",
        "post":"a posté %{what}",
        "sending":"t’a envoyé %{item_title}",
        "invitation":"Connexion réussie avec %{you}",
        "you":"toi",
        "empty_screen":"Quand on aime on partage."
    },
    util: {
        time: {
            since_seconds: {
                zero: "",
                one: "Il y a 1 seconde",
                other: "Il y a %{count} secondes"
            },
            since_minutes: {
                zero: "",
                one: "Il y a 1 minute",
                other: "Il y a %{count} minutes"
            },
            since_hours: {
                zero: "",
                one: "Il y a 1 heure",
                other: "Il y a %{count} heures"
            },
            since_days: {
                zero: "",
                one: "Il y a 1 jour",
                other: "Il y a %{count} jours"
            },
            since_months: {
                zero: "",
                one: "Il y a 1 mois",
                other: "Il y a %{count} mois"
            },
            since_years: {
                zero: "",
                one: "Il y a 1 an",
                other: "Il y a %{count} ans"
            },
        }
    },
    loadmore: "Chargement...",
    send_message: "Je pense que tu vas aimer :\n%{what}\n%{url}\nTrouvé grâce à Goodsh https://goodsh.it/",
    goodsh_url: "https:\/\/goodsh.it\/",
    friends: {
        empty_screen: "Profite pleinement de Goodsh et invite des proches.",
        buttons: {
            connect: "Connecter",
            disconnect: "Déconnecter",
        },
        messages: {
            connect: "connecté",
            disconnect: "déconnecté",
        },
        alert: {
            title: "Déconnexion",
            label: "Êtes-vous sûr de vouloir vous déconnecter ?"
        }
    },
    empty: {
        lineup: "Ach, cette liste est vide\net c'est bien dommage !"
    },
    activity_action_bar: {
        goodsh_deleted: "Goodsh supprimé",
        comment: {
            title: "Commentaires"
        },
        response: {
            title: "Réponses"
        }
    },
    add_item_screen: {
        title: "Choisir une liste"
    },
    home_search_screen: {
        saving: {
            title: "Détails",
        },
        community: {
            title: "Mon réseau",
        }
    },
    actions: {
        ok: "Ok",
        add: "Ajouter",
        delete: "Supprimer",
        change: "Modifier",
        change_title: "Modifier le titre",
        undo: "Annuler",
        cancel: "Annuler",
        buy: "Acheter",
        send: "Envoyer",
        create: "Créer",
        try_again: "Réessayer",
        ask_friend: "Poser une\nquestion à\nmon réseau",
        logout: "Déconnexion",
        terms: "Conditions d'utilisation",
        copy_link: "Copier le lien",
        send_to_goodsher: "Envoyer à un contact",
        skip: "OK",
        ask: "Demander à mon réseau",
        invite: "Inviter un ami"

    },
    common: {
        empty_feed_generic: "Quand on aime on partage.\nCrée ton réseau de contacts. ",
        api: {
            generic_error: "Oups... Y a quelque chose qui cloche."
        }
    },
    ask: {
        sent: "Demande envoyée"
    },
    share_goodsh: {
        title: "Viens goodsher avec moi.",
        message: "Rejoins-moi sur Goodsh : https://goodsh.it/",
    },
    loading: {
        error: "Z@#u$%t, le chargement a échoué. "
    },
    alert: {
        delete: {
            title: "Suppression",
            label: "Confirmer la suppression ?"
        }
    },
    dev: {
        label: "Dev mode",
        title: "DevMenu"
    }
};
