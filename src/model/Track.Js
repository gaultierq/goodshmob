import Item from "./Item";

export default class Track extends Item {

    artist_names;
    album_type;
    duration_ms;
    track_number;
    preview_url;
    disc_number;

    location() {
        return null;
    }

}
