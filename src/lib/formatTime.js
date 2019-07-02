function formatTime(time) {
    let diff = new Date().getTime() - time;
    diff = Math.max(Math.trunc(diff / 1000), 1);
    if (diff < 60) return `${diff} Second${diff > 1 ? `s` : ``} Ago`;
    diff = Math.max(Math.trunc(diff / 60), 1);
    if (diff < 60) return `${diff} Minute${diff > 1 ? `s` : ``} Ago`;
    diff = Math.max(Math.trunc(diff / 60), 1);
    if (diff < 60) return `${diff} Hour${diff > 1 ? `s` : ``} Ago`;
    diff = Math.max(Math.trunc(diff / 24), 1);
    if (diff < 7) return `${diff} Day${diff > 1 ? `s` : ``} Ago`;
    let weeks = Math.max(Math.trunc(diff / 7), 1);
    diff = Math.trunc(diff % 7);
    return `${weeks} Week${weeks > 1 ? `s` : ``}${diff > 0 ? `, ${diff} Day${diff > 1 ? `s` : ``}` : ``} Ago`;
}

export default formatTime;