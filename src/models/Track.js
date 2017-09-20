import Item from "./Item";

export default class Track extends Item {

    artistNames;
    albumType;
    durationMs;
    trackNumber;
    previewUrl;
    discNumber;

    location() {
        return null;
    }

}
