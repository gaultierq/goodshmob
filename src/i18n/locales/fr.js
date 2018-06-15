export default {
    app : {
        update: {
            title: "Mise à jour",
            label : "Mise à jour de goodsh.it. Un peu de patience..."
        }
    },
    "tabs": {
        home: {
            title: "Mes listes"
        },
        network: {
            title: "Fil d'actualité"
        }
    },
    lineups: {
        filter: {
            empty: "Pas de résultat",
            deepsearch: "Chercher dans toutes mes listes",
        },
        search: {
            placeholder: "##Rechercher",
            empty: "Pas de résultat.",
        },
        goodsh : {
            title: "À ranger plus tard"
        },
        mine : {
            title: "Mes listes"
        },
        others: {
            title: "Autres listes"
        },
        empty_screen: "Retrouve ici tous tes goodsh.\nTap '+' pour en ajouter un."
    },
    no_spam: {
        dialog_title: "Les 3 grands principes de goodsh.it",
        dialog_body: "- Tes goodsh ne sont visibles **QUE** par toi et ton réseau\n\n" +
        "- Quand tu enregistres un goodsh, tes contacts ne sont **PAS** notifiés\n\n" +
        "- Pour un goodsh **COMPLÈTEMENT** privé, active le cadenas",
        dialog_button: 'OK',
    },
    tips: {
        visibility: {
            title: "Visibilité",
            text: "Tes goodsh ne sont visibles que par toi et ton réseau",
            button: "OK"
        },
        noise: {
            title: "Notification",
            text: "Quand tu enregistres un goodsh, tes contacts ne sont pas notifiés",
            button: "OK"
        },
        full_private: {
            title: "Privé",
            text: "Pour un goodsh complètement privé, active le cadenas",
            button: "OK"
        },
    },
    home: {
        wizard: {
            action_button_label : "Ajouter un coup de coeur,\nune envie, un conseil.",
            action_button_body : "Livre, film, série, resto, musique...",
        },
        tabs: {
            my_goodsh: "Mes listes",
            my_interests: "Listes suivies",
        }
    },
    search: {
        in_items: "Saisir le nom à enregistrer",
        in_network: "Rechercher dans mon réseau",
        in_feed: "Rechercher dans mes listes",
        by: "par"
    },
    "shared":{
        "goodsh_saved":"Enregistré",
        "add":"Ajouter",
        "link_copied":"Lien copié ✓",
    },
    "activity_item": {
        header: {
            in: "%{adder} dans %{lineup}",
            added_somewhere: "l'a ajouté",
            to: "%{from} a envoyé %{what} à %{to}",
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
            "no_comments":"Un avis ? Une suggestion ? Une question ?",
            "user_answered":"a commenté",
            "has_commented": {
                zero: "%{first} a commenté",
                one: "%{first} et %{second} ont commenté",
                other: "%{first} et %{count} autres ont commenté"
            },
            "has_commented_this": {
                zero: "%{first} a commenté",
                one: "%{first} et %{second} ont commenté",
                other: "%{first} et %{count} autres ont commenté"
            },
            "has_commented_this_as_well": {
                zero: "%{first} a aussi commenté",
                one: "%{first} et %{second} ont aussi commenté",
                other: "%{first} et %{count} autres ont aussi commenté"
            },
            "see_theirs_comments": {
                zero: "Voir ses commentaires.",
                one: "Voir ses commentaires.",
                other: "Voir leurs commentaires."
            }
        }
    },
    "login_screen":{
        "facebook_signin":"SE CONNECTER AVEC FACEBOOK",
        "no_publication":"goodsh.it ne publie rien sur Facebook.",
        "account_kit_signin":"Se connecter sans Facebook",
        "definition":{
            "example":"##Bouquin, restaurant, film, série, artiste,\nlieu, musique, gadget, fringue, vin, …"
        },
        "value_proposal":"##Marre d’oublier les recommandations\nqu’on te fait ?",
        "slider_intro_1": "On m'a dit que c’était top.\nPour ne pas l'oublier\nje l’ai goodshé.",
        "slider_intro_2": "Je retrouve mes recos quand j'en ai besoin.\nEt je peux les partager facilement.",
        "slider_intro_3": "Je demande des avis, des idées, des conseils à mon réseau.",
        "slider_intro_4": "Je découvre livres, films, musiques, restos, idées cadeau, choses à faire...et j'achète en un clin d'oeil.",
        "credentials": "Fait main en 2018",
    },
    "popular_screen":{
        "title": "Enregistrer vos premières envies",
        "main_explanation": "En choisissant parmi le palmarès du moment :",
        "empty": "No popular items found",
        item_selected: {
            zero: "Sélectionner des envies",
            one: "Ajouter 1 élément",
            other: "Ajouter %{count} éléments"
        },
        "button_skip": "Passer",
        "button_next": "Ajouter",
    },
    "profile_screen":{
        "title":"Feedback",
        "subtitle":"##Comment tu la trouves ? Tu la kiffes ? Qu'est-ce qui manque cruellement ? On a très envie de savoir...",
    },
    "detail_screen":{
        "related_activities_title": "Autres activités"
    },
    "create_list_controller":{
        "title":"+ Nouvelle liste",
        "subtitle":"##Pour y ranger plein de trucs top et les partager si je veux",
        "placeholder":"Sois créatif !",
        "action":"Créer une nouvelle liste",
        "created":"Liste créée",
        "visible":"Visible par mon réseau",
        "unvisible":"Visible que par moi",
        "add_description":"Ajouter un petit mot",
        "choose_list":"Choisir une liste",
        "choose_another_list":"Choisir une autre liste",
        "all_list" : "Toutes mes listes",
        "add_to_list": "Ajouter à"
    },
    "search_bar":{
        "me_placeholder":"##Rechercher dans mes listes",
        "network_placeholder":"##Rechercher dans mon réseau"
    },
    "network_search_tabs":{
        "savings":"LISTES",
        "users":"MEMBRES"
    },
    "community":{
        "screens": {
            "friends":"MES CONTACTS",
            "notifications":"NOTIFICATIONS",
        },
        "empty_screen": "Découvre ici les actus de tes contacts."
    },
    "my_interests_screen":{
        "empty_screen": "Explore les listes de tes amis, et suis les plus intéressantes !",
        "search_lists": "Trouver des listes à suivre"
    },
    "comments_screen":{
        "title": "Commentaires"
    },
    "search_screen":{
        "title": "Rechercher"
    },
    "search_item_screen":{
        "tabs": {
            "consumer_goods":"LIVRE\n&\nAUTRES",
            "places":"LIEU",
            "movies":"FILM\n&\nSERIE",
            "musics":"SON"
        },
        "placeholder": {
            "consumer_goods":"livre, cadeau, gadget,\nchaussures, vin, jouet...",
            "places":"restaurant, café,\nboutique, hôtel, musée,\nville, plage, lieu touristique...",
            "movies":"film, série, documentaire, émission... ",
            "musics":"titre, artiste, album...",
            "savings": "Saisir des mots-clés pour trouver des listes à suivre",
            "users": "Chercher des membres à suivre",

        },
        "search_options":  {
            "around_me": "Autour de moi"
        }
    },
    "activity_comments_screen":{
        "add_comment_placeholder":"Répondre"
    },
    "send_screen":{
        "add_description_placeholder":"Adresser un petit mot à %{recipient}",
        "sent": "Envoyé"
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
            since_seconds: "à l'instant",
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
    loadmore: "Chargement",
    send_message: "Je t'envoie ceci de goodsh.it : l'app où tu stockes tout ce que tu aimes.",
    send_object: "te recommande %{what} - via goodsh.it",
    goodsh_url: "https:\/\/goodsh.it\/",
    friends: {
        empty_screen: "Profite pleinement de goodsh.it et invite des proches.",
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
    follow: {
        alert: {
            title_unfollow: "Ne plus suivre",
            label: "Êtes-vous sûr de vouloir ne plus suivre cette liste ?",
        },
        messages: {
            unfollowed: "Vous ne suivez plus cette liste",
            followed: "Liste suivie"
        }
    },
    unsave_screen: {
        unsave_button: {
            idle: "Supprimer",
            sending: "Suppression...",
            ok: "Supprimé",
            ko: "Ré-essayer",
        }
    },
    empty: {
        lineup: "Cette liste est vide\n ajoute ce que tu aimes !"
    },
    activity_action_bar: {
        goodsh_deleted: "Goodsh supprimé",
        goodsh_deleted_undo: "Restaurer",
        goodsh_bookmarked: "Goodsh ajouté dans %{lineup}",
        goodsh_bookmarked_change_lineup: "Changer",
        comment: {
            title: "Commentaires"
        },
        response: {
            title: "Réponses"
        }
    },
    "more_activities": {
        zero: "",
        one: "%{count} activité supplémentaire",
        other: "%{count} activités supplémentaires",
    },
    "there_are_activities": {
        zero: "",
        one: "Il y a",
        other: "Il y a",
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
        edit_saving_menu: "Éditer ce goodsh",
        share_list: "Partager cette liste",
        change_description: "Modifier la description",
        move: "Déplacer",
        change_name: "Changer le nom de cette liste",
        undo: "Annuler",
        cancel: "Annuler",
        buy: "Acheter",
        send: "Envoyer",
        create: "Créer",
        try_again: "Réessayer",
        ask_friend: "Poser une question à mon réseau",
        logout: "Déconnexion",
        follow: "Suivre",
        unfollow: "Ne plus suivre",
        terms: "Conditions d'utilisation",
        copy_link: "Copier le lien",
        send_to_goodsher: "Envoyer à un contact",
        skip: "OK",
        ask: "Demander à mon réseau",
        ask_button: "Ask",
        invite: "Inviter des amis",
        load_more: "Charger la suite",
        unsave: "Supprimer",
        save: "Enregistrer",

    },
    common: {
        empty_feed_generic: "Quand on aime on partage.\nCrée ton réseau de contacts.",
        api: {
            generic_error: "Oups... Problème de connexion."
        }
    },
    ask: {
        sent: "Demande envoyée",
        cancel: "Annuler la demande ?",
        minimal_length: "La question doit faire au moins 10 caractères."
    },
    share_goodsh: {
        title: "Viens goodsher avec moi.",
        message: "Je t'invite sur goodsh.it : l'app où tu stockes tout ce que tu aimes. https://goodsh.it/",
    },
    loading: {
        error: "Oups... Problème avec internet. "
    },
    alert: {
        delete: {
            title: "Enlever de mes listes",
            label: "Confirmer ?"
        },
        position: {
            title: "Lieux autour de moi",
            message: "Pour trouver les lieux autour de vous, activer la localisation",
            button: "Activer"
        }
    },
    dev: {
        label: "Menu de développement",
        title: "DevMenu"
    },
    congrats: {
        generic: "C'est fait ;)"
    },
    errors: {
        unavailable: 'Le contenu n\'est pas disponible',
        generic: "Oups... Il y a quelquechose qui cloche"
    },
    form: {
        label: {
            last_name: 'Nom',
            first_name: 'Prénom'
        },
        warning: {
            fill_all_fields: 'Veuillez remplir tous les champs',

        },
        description: {
            user_name: 'Veuillez indiquer vos noms et prénoms'
        }
    },
    user_sheet: {
        goodsh_count: "Goodshs",
        lineup_count: "Listes",
        friend_count: "Contacts",
    },
    current_location: "Autour de moi"
};
