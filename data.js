/**
 * One Year Bible Reading Plan Data
 * Rencana Baca Alkitab Setahun dengan Eksegesis
 */

// Book categories for icons
const BOOK_CATEGORIES = {
    law: ['Kejadian', 'Keluaran', 'Imamat', 'Bilangan', 'Ulangan'],
    history: ['Yosua', 'Hakim-hakim', 'Rut', '1 Samuel', '2 Samuel', '1 Raja-raja', '2 Raja-raja', '1 Tawarikh', '2 Tawarikh', 'Ezra', 'Nehemia', 'Ester'],
    wisdom: ['Ayub', 'Mazmur', 'Amsal', 'Pengkhotbah', 'Kidung Agung'],
    majorProphets: ['Yesaya', 'Yeremia', 'Ratapan', 'Yehezkiel', 'Daniel'],
    minorProphets: ['Hosea', 'Yoel', 'Amos', 'Obaja', 'Yunus', 'Mikha', 'Nahum', 'Habakuk', 'Zefanya', 'Hagai', 'Zakharia', 'Maleakhi'],
    gospels: ['Matius', 'Markus', 'Lukas', 'Yohanes'],
    acts: ['Kisah Para Rasul'],
    pauline: ['Roma', '1 Korintus', '2 Korintus', 'Galatia', 'Efesus', 'Filipi', 'Kolose', '1 Tesalonika', '2 Tesalonika', '1 Timotius', '2 Timotius', 'Titus', 'Filemon'],
    general: ['Ibrani', 'Yakobus', '1 Petrus', '2 Petrus', '1 Yohanes', '2 Yohanes', '3 Yohanes', 'Yudas'],
    apocalyptic: ['Wahyu']
};

// Get book icon based on category
function getBookIcon(bookName) {
    for (const [category, books] of Object.entries(BOOK_CATEGORIES)) {
        if (books.some(book => bookName.includes(book))) {
            switch (category) {
                case 'law': return '📜';
                case 'history': return '⚔️';
                case 'wisdom': return '💎';
                case 'majorProphets': return '🔥';
                case 'minorProphets': return '📣';
                case 'gospels': return '✝️';
                case 'acts': return '🌍';
                case 'pauline': return '✉️';
                case 'general': return '📬';
                case 'apocalyptic': return '👑';
            }
        }
    }
    return '📖';
}

// Indonesian Bible passages (Terjemahan Baru)
const INDONESIAN_PASSAGES = {
    'Kejadian 1': `<span class="verse-number">1</span>Pada mulanya Allah menciptakan langit dan bumi. <span class="verse-number">2</span>Bumi belum berbentuk dan kosong; gelap gulita menutupi samudera raya, dan Roh Allah melayang-layang di atas permukaan air. <span class="verse-number">3</span>Berfirmanlah Allah: "Jadilah terang." Lalu terang itu jadi. <span class="verse-number">4</span>Allah melihat bahwa terang itu baik, lalu dipisahkan-Nyalah terang itu dari gelap. <span class="verse-number">5</span>Dan Allah menamai terang itu siang, dan gelap itu malam. Jadilah petang dan jadilah pagi, itulah hari pertama. <span class="verse-number">6</span>Berfirmanlah Allah: "Jadilah cakrawala di tengah segala air untuk memisahkan air dari air." <span class="verse-number">7</span>Maka Allah menjadikan cakrawala dan Ia memisahkan air yang ada di bawah cakrawala itu dari air yang ada di atasnya. Dan jadilah demikian. <span class="verse-number">8</span>Lalu Allah menamai cakrawala itu langit. Jadilah petang dan jadilah pagi, itulah hari kedua.`,
    'Kejadian 2': `<span class="verse-number">1</span>Demikianlah diselesaikan langit dan bumi dan segala isinya. <span class="verse-number">2</span>Ketika Allah pada hari ketujuh telah menyelesaikan pekerjaan yang dibuat-Nya itu, berhentilah Ia pada hari ketujuh dari segala pekerjaan yang telah dibuat-Nya itu. <span class="verse-number">3</span>Lalu Allah memberkati hari ketujuh itu dan menguduskannya, karena pada hari itulah Ia berhenti dari segala pekerjaan penciptaan yang telah dibuat-Nya itu. <span class="verse-number">4</span>Demikianlah riwayat langit dan bumi pada waktu diciptakan.`,
    'Kejadian 3': `<span class="verse-number">1</span>Adapun ular ialah yang paling cerdik dari segala binatang di darat yang dijadikan oleh TUHAN Allah. Ular itu berkata kepada perempuan itu: "Tentulah Allah berfirman: Semua pohon dalam taman ini jangan kamu makan buahnya, bukan?" <span class="verse-number">2</span>Lalu sahut perempuan itu kepada ular itu: "Buah pohon-pohonan dalam taman ini boleh kami makan, <span class="verse-number">3</span>tetapi tentang buah pohon yang ada di tengah-tengah taman, Allah berfirman: Jangan kamu makan ataupun raba buah itu, nanti kamu mati."`,
    'Matius 1': `<span class="verse-number">1</span>Inilah silsilah Yesus Kristus, anak Daud, anak Abraham. <span class="verse-number">2</span>Abraham memperanakkan Ishak, Ishak memperanakkan Yakub, Yakub memperanakkan Yehuda dan saudara-saudaranya, <span class="verse-number">3</span>Yehuda memperanakkan Peres dan Zerah dari Tamar, Peres memperanakkan Hezron, Hezron memperanakkan Ram. <span class="verse-number">21</span>Ia akan melahirkan anak laki-laki dan engkau akan menamakan Dia Yesus, karena Dialah yang akan menyelamatkan umat-Nya dari dosa mereka. <span class="verse-number">22</span>Hal itu terjadi supaya genaplah yang difirmankan Tuhan oleh nabi: <span class="verse-number">23</span>"Sesungguhnya, anak dara itu akan mengandung dan melahirkan seorang anak laki-laki, dan mereka akan menamakan Dia Imanuel" -- yang berarti: Allah menyertai kita.`,
    'Matius 2': `<span class="verse-number">1</span>Sesudah Yesus dilahirkan di Betlehem di tanah Yudea pada zaman raja Herodes, datanglah orang-orang majus dari Timur ke Yerusalem <span class="verse-number">2</span>dan bertanya-tanya: "Di manakah Dia, raja orang Yahudi yang baru dilahirkan itu? Kami telah melihat bintang-Nya di Timur dan kami datang untuk menyembah Dia." <span class="verse-number">3</span>Ketika raja Herodes mendengar hal itu terkejutlah ia beserta seluruh Yerusalem.`,
    'Mazmur 1': `<span class="verse-number">1</span>Berbahagialah orang yang tidak berjalan menurut nasihat orang fasik, yang tidak berdiri di jalan orang berdosa, dan yang tidak duduk dalam kumpulan pencemooh, <span class="verse-number">2</span>tetapi yang kesukaannya ialah Taurat TUHAN, dan yang merenungkan Taurat itu siang dan malam. <span class="verse-number">3</span>Ia seperti pohon, yang ditanam di tepi aliran air, yang menghasilkan buahnya pada musimnya, dan yang tidak layu daunnya; apa saja yang diperbuatnya berhasil. <span class="verse-number">4</span>Bukan demikian orang fasik: mereka seperti sekam yang ditiupkan angin. <span class="verse-number">5</span>Sebab itu orang fasik tidak akan tahan dalam penghakiman, begitu pula orang berdosa dalam perkumpulan orang benar; <span class="verse-number">6</span>sebab TUHAN mengenal jalan orang benar, tetapi jalan orang fasik menuju kebinasaan.`,
    'Mazmur 2': `<span class="verse-number">1</span>Mengapa rusuh bangsa-bangsa, mengapa suku-suku bangsa mereka-reka perkara yang sia-sia? <span class="verse-number">2</span>Raja-raja dunia bersiap-siap dan para pembesar bermufakat bersama-sama melawan TUHAN dan yang diurapi-Nya: <span class="verse-number">3</span>"Marilah kita memutuskan belenggu-belenggu mereka dan membuang tali-tali mereka dari pada kita!" <span class="verse-number">4</span>Dia yang bersemayam di sorga tertawa; Tuhan mengolok-olok mereka.`,
    'Mazmur 23': `<span class="verse-number">1</span>TUHAN adalah gembalaku, takkan kekurangan aku. <span class="verse-number">2</span>Ia membaringkan aku di padang yang berumput hijau, Ia membimbing aku ke air yang tenang; <span class="verse-number">3</span>Ia menyegarkan jiwaku. Ia menuntun aku di jalan yang benar oleh karena nama-Nya. <span class="verse-number">4</span>Sekalipun aku berjalan dalam lembah kekelaman, aku tidak takut bahaya, sebab Engkau besertaku; gada-Mu dan tongkat-Mu, itulah yang menghibur aku. <span class="verse-number">5</span>Engkau menyediakan hidangan bagiku, di hadapan lawanku; Engkau mengurapi kepalaku dengan minyak; pialaku penuh melimpah. <span class="verse-number">6</span>Kebajikan dan kemurahan belaka akan mengikuti aku, seumur hidupku; dan aku akan diam dalam rumah TUHAN sepanjang masa.`,
    'Amsal 1': `<span class="verse-number">1</span>Amsal-amsal Salomo bin Daud, raja Israel, <span class="verse-number">2</span>untuk mengenal hikmat dan didikan, untuk mengerti kata-kata yang bermakna, <span class="verse-number">3</span>untuk menerima didikan yang menjadikan pandai, yaitu kebenaran, keadilan dan kejujuran, <span class="verse-number">4</span>untuk memberikan kecerdasan kepada orang yang tak berpengalaman, dan pengetahuan serta kebijaksanaan kepada orang muda-- <span class="verse-number">5</span>baiklah orang bijak mendengar dan menambah ilmu dan baiklah orang berpengertian memperoleh bahan pertimbangan-- <span class="verse-number">6</span>untuk mengerti amsal dan ibarat, perkataan orang bijak dan teka-tekinya. <span class="verse-number">7</span>Takut akan TUHAN adalah permulaan pengetahuan, tetapi orang bodoh menghina hikmat dan didikan.`,
    'Yohanes 1': `<span class="verse-number">1</span>Pada mulanya adalah Firman; Firman itu bersama-sama dengan Allah dan Firman itu adalah Allah. <span class="verse-number">2</span>Ia pada mulanya bersama-sama dengan Allah. <span class="verse-number">3</span>Segala sesuatu dijadikan oleh Dia dan tanpa Dia tidak ada suatupun yang telah jadi dari segala yang telah dijadikan. <span class="verse-number">4</span>Dalam Dia ada hidup dan hidup itu adalah terang manusia. <span class="verse-number">5</span>Terang itu bercahaya di dalam kegelapan dan kegelapan itu tidak menguasainya. <span class="verse-number">14</span>Firman itu telah menjadi manusia, dan diam di antara kita, dan kita telah melihat kemuliaan-Nya, yaitu kemuliaan yang diberikan kepada-Nya sebagai Anak Tunggal Bapa, penuh kasih karunia dan kebenaran.`,
    'Yohanes 3': `<span class="verse-number">16</span>Karena begitu besar kasih Allah akan dunia ini, sehingga Ia telah mengaruniakan Anak-Nya yang tunggal, supaya setiap orang yang percaya kepada-Nya tidak binasa, melainkan beroleh hidup yang kekal. <span class="verse-number">17</span>Sebab Allah mengutus Anak-Nya ke dalam dunia bukan untuk menghakimi dunia, melainkan untuk menyelamatkannya oleh Dia.`,
    'Roma 8': `<span class="verse-number">28</span>Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia, yaitu bagi mereka yang terpanggil sesuai dengan rencana Allah. <span class="verse-number">31</span>Jika Allah di pihak kita, siapakah yang akan melawan kita? <span class="verse-number">37</span>Tetapi dalam semuanya itu kita lebih dari pada orang-orang yang menang, oleh Dia yang telah mengasihi kita. <span class="verse-number">38</span>Sebab aku yakin, bahwa baik maut, maupun hidup, baik malaikat-malaikat, maupun pemerintah-pemerintah, baik yang ada sekarang, maupun yang akan datang, atau kuasa-kuasa, <span class="verse-number">39</span>baik yang di atas, maupun yang di bawah, ataupun sesuatu makhluk lain, tidak akan dapat memisahkan kita dari kasih Allah, yang ada dalam Kristus Yesus, Tuhan kita.`
};

// Keep old variable for backward compatibility
const SAMPLE_PASSAGES = INDONESIAN_PASSAGES;

// Sample Exegesis data
const EXEGESIS_DATA = {
    'Kejadian 1': {
        context: 'Pasal pembukaan Alkitab yang menjelaskan asal-usul alam semesta dan segala isinya. Ditulis oleh Musa sekitar 1400 SM.',
        keywords: {
            'Bara (בָּרָא)': 'Kata Ibrani untuk "menciptakan", hanya digunakan untuk Allah',
            'Ruach (רוּחַ)': 'Roh atau nafas Allah',
            'Tov (טוֹב)': 'Baik, sempurna menurut standar Allah'
        },
        themes: ['Kedaulatan Allah atas ciptaan', 'Keteraturan dalam penciptaan (dari kekacauan ke keteraturan)', 'Kebaikan intrinsik ciptaan Allah', 'Manusia sebagai puncak ciptaan'],
        application: 'Mengakui Allah sebagai Pencipta berarti mengakui-Nya sebagai pemilik sah atas hidup kita. Kita diciptakan dengan tujuan dan rancangan ilahi.'
    },
    'Matius 1': {
        context: 'Injil Matius ditulis terutama untuk pembaca Yahudi, menunjukkan Yesus sebagai Mesias yang dijanjikan. Silsilah membuktikan keturunan-Nya dari Daud.',
        keywords: {
            'Christos (Χριστός)': 'Mesias, Yang Diurapi',
            'Emmanuel': 'Allah menyertai kita',
            'Yeshua': 'TUHAN menyelamatkan'
        },
        themes: ['Pemenuhan nubuatan Perjanjian Lama', 'Inkarnasi - Allah menjadi manusia', 'Keselamatan dari dosa', 'Kontinuitas rencana Allah'],
        application: 'Yesus datang sebagai pemenuhan janji Allah. Nama-Nya mencerminkan misi-Nya: menyelamatkan kita dari dosa.'
    },
    'Mazmur 1': {
        context: 'Mazmur pembukaan yang berfungsi sebagai gerbang masuk ke seluruh kitab Mazmur. Menyajikan dua jalan hidup yang kontras.',
        keywords: {
            'Ashrei (אַשְׁרֵי)': 'Berbahagialah, diberkati',
            'Torah': 'Pengajaran, hukum Allah',
            'Hagah': 'Merenungkan, bermeditasi'
        },
        themes: ['Dua jalan hidup: benar vs fasik', 'Pentingnya merenungkan Firman', 'Hasil dari pilihan hidup', 'Kebahagiaan sejati dalam Allah'],
        application: 'Kebahagiaan sejati tidak ditemukan dalam mengikuti arus dunia, melainkan dalam merenungkan dan menaati Firman Tuhan setiap hari.'
    }
};

// Generate 365 days reading plan
const READING_PLAN = [];

// Old Testament books with chapters
const OT_BOOKS = [
    { name: 'Kejadian', chapters: 50 }, { name: 'Keluaran', chapters: 40 },
    { name: 'Imamat', chapters: 27 }, { name: 'Bilangan', chapters: 36 },
    { name: 'Ulangan', chapters: 34 }, { name: 'Yosua', chapters: 24 },
    { name: 'Hakim-hakim', chapters: 21 }, { name: 'Rut', chapters: 4 },
    { name: '1 Samuel', chapters: 31 }, { name: '2 Samuel', chapters: 24 },
    { name: '1 Raja-raja', chapters: 22 }, { name: '2 Raja-raja', chapters: 25 },
    { name: '1 Tawarikh', chapters: 29 }, { name: '2 Tawarikh', chapters: 36 },
    { name: 'Ezra', chapters: 10 }, { name: 'Nehemia', chapters: 13 },
    { name: 'Ester', chapters: 10 }, { name: 'Ayub', chapters: 42 },
    { name: 'Mazmur', chapters: 150 }, { name: 'Amsal', chapters: 31 },
    { name: 'Pengkhotbah', chapters: 12 }, { name: 'Kidung Agung', chapters: 8 },
    { name: 'Yesaya', chapters: 66 }, { name: 'Yeremia', chapters: 52 },
    { name: 'Ratapan', chapters: 5 }, { name: 'Yehezkiel', chapters: 48 },
    { name: 'Daniel', chapters: 12 }, { name: 'Hosea', chapters: 14 },
    { name: 'Yoel', chapters: 3 }, { name: 'Amos', chapters: 9 },
    { name: 'Obaja', chapters: 1 }, { name: 'Yunus', chapters: 4 },
    { name: 'Mikha', chapters: 7 }, { name: 'Nahum', chapters: 3 },
    { name: 'Habakuk', chapters: 3 }, { name: 'Zefanya', chapters: 3 },
    { name: 'Hagai', chapters: 2 }, { name: 'Zakharia', chapters: 14 },
    { name: 'Maleakhi', chapters: 4 }
];

// New Testament books with chapters
const NT_BOOKS = [
    { name: 'Matius', chapters: 28 }, { name: 'Markus', chapters: 16 },
    { name: 'Lukas', chapters: 24 }, { name: 'Yohanes', chapters: 21 },
    { name: 'Kisah Para Rasul', chapters: 28 }, { name: 'Roma', chapters: 16 },
    { name: '1 Korintus', chapters: 16 }, { name: '2 Korintus', chapters: 13 },
    { name: 'Galatia', chapters: 6 }, { name: 'Efesus', chapters: 6 },
    { name: 'Filipi', chapters: 4 }, { name: 'Kolose', chapters: 4 },
    { name: '1 Tesalonika', chapters: 5 }, { name: '2 Tesalonika', chapters: 3 },
    { name: '1 Timotius', chapters: 6 }, { name: '2 Timotius', chapters: 4 },
    { name: 'Titus', chapters: 3 }, { name: 'Filemon', chapters: 1 },
    { name: 'Ibrani', chapters: 13 }, { name: 'Yakobus', chapters: 5 },
    { name: '1 Petrus', chapters: 5 }, { name: '2 Petrus', chapters: 3 },
    { name: '1 Yohanes', chapters: 5 }, { name: '2 Yohanes', chapters: 1 },
    { name: '3 Yohanes', chapters: 1 }, { name: 'Yudas', chapters: 1 },
    { name: 'Wahyu', chapters: 22 }
];

// Generate all OT chapters
let otChapters = [];
OT_BOOKS.forEach(book => {
    for (let i = 1; i <= book.chapters; i++) {
        otChapters.push(`${book.name} ${i}`);
    }
});

// Generate all NT chapters
let ntChapters = [];
NT_BOOKS.forEach(book => {
    for (let i = 1; i <= book.chapters; i++) {
        ntChapters.push(`${book.name} ${i}`);
    }
});

// Psalms for daily reading (cycle through)
let psalmChapters = [];
for (let i = 1; i <= 150; i++) {
    psalmChapters.push(`Mazmur ${i}`);
}

// Proverbs chapters
let proverbChapters = [];
for (let i = 1; i <= 31; i++) {
    proverbChapters.push(`Amsal ${i}`);
}

// Create 365-day plan
let otIndex = 0;
let ntIndex = 0;
let psalmIndex = 0;
let proverbIndex = 0;

for (let day = 1; day <= 365; day++) {
    const readings = [];

    // Add 3 OT chapters per day (approximately)
    for (let i = 0; i < 3 && otIndex < otChapters.length; i++) {
        // Skip Psalms and Proverbs as they're added separately
        if (!otChapters[otIndex].startsWith('Mazmur') && !otChapters[otIndex].startsWith('Amsal')) {
            readings.push(otChapters[otIndex]);
        }
        otIndex++;
    }

    // Add 1 NT chapter per day
    if (ntIndex < ntChapters.length) {
        readings.push(ntChapters[ntIndex]);
        ntIndex++;
    }

    // Add 1 Psalm
    readings.push(psalmChapters[psalmIndex % 150]);
    psalmIndex++;

    // Add Proverbs based on day of month simulation
    const proverbDay = ((day - 1) % 31);
    readings.push(proverbChapters[proverbDay]);

    READING_PLAN.push({
        day: day,
        readings: readings
    });
}

// Get default exegesis for any passage
function getExegesis(passage) {
    if (EXEGESIS_DATA[passage]) {
        return EXEGESIS_DATA[passage];
    }

    // Generate default exegesis structure
    const bookName = passage.replace(/\s\d+$/, '');
    return {
        context: `Bagian dari kitab ${bookName}. Pelajari konteks historis dan literal dari pasal ini untuk pemahaman yang lebih dalam.`,
        keywords: {
            'Studi Kata': 'Pelajari kata-kata kunci dalam bahasa asli (Ibrani/Yunani) untuk pemahaman yang lebih kaya.',
            'Referensi Silang': 'Bandingkan dengan ayat-ayat terkait di seluruh Alkitab.'
        },
        themes: [
            'Identifikasi tema-tema utama dalam bacaan ini',
            'Perhatikan bagaimana tema ini terhubung dengan keseluruhan narasi Alkitab',
            'Cari prinsip-prinsip teologis yang dapat diterapkan'
        ],
        application: 'Renungkan bagaimana kebenaran dalam pasal ini dapat mengubah cara Anda berpikir, bertindak, dan berhubungan dengan Allah dan sesama.'
    };
}

// Get passage text (sample or placeholder)
function getPassageText(passage) {
    if (SAMPLE_PASSAGES[passage]) {
        return SAMPLE_PASSAGES[passage];
    }
    return `<p class="placeholder-text"><em>Teks ${passage} akan ditampilkan di sini. Anda dapat mengintegrasikan API Alkitab untuk menampilkan teks lengkap.</em></p>`;
}

// Get Indonesian passage specifically
function getIndonesianPassage(passage) {
    if (INDONESIAN_PASSAGES[passage]) {
        return {
            success: true,
            html: `<div class="translation-badge">Terjemahan Baru (TB)</div>${INDONESIAN_PASSAGES[passage]}`,
            translation: 'Terjemahan Baru'
        };
    }
    return {
        success: false,
        html: `<p class="placeholder-text"><em>Teks Indonesia untuk ${passage} belum tersedia. Silakan gunakan terjemahan Inggris.</em></p>`,
        translation: null
    };
}

// Export for use in app.js
window.BibleData = {
    READING_PLAN,
    getBookIcon,
    getExegesis,
    getPassageText,
    getIndonesianPassage,
    INDONESIAN_PASSAGES,
    BOOK_CATEGORIES
};
