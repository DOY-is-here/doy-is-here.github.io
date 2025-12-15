let meta = null;

if (postNum !== null && metadata[rawDate] && metadata[rawDate][postNum]) {
    meta = metadata[rawDate][postNum];
} else if (metadata[rawDate] && typeof metadata[rawDate] === 'object' && !metadata[rawDate].caption) {
    return post;
} else if (metadata[rawDate]) {
    meta = metadata[rawDate];
}

if (meta) {
    if (meta.caption) post.caption = meta.caption;
    if (meta.username) post.username = meta.username;
    if (meta.displayDate) post.displayDate = meta.displayDate;
}

return post;