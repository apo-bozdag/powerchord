# powerchord

normal akorlari power chord'a ceviren, bass notalarini gosteren, uzerine solo rehberi ve lick kutuphanesi veren bir arac.

elektro gitarda riff yazarken lazim olan her sey tek sayfada.

## ne yapar

akorlari yaziyorsun (mesela `Am Dm Em C`), o sana:

- **power chord tab'lari** - her akorun 2 telli power chord hali
- **bass notalari** - altta ne calacagini gosteriyor
- **birlesik tab** - power + bass beraber, ust 3 tel bos (solo icin)
- **fretboard diyagramlari** - ahsap dokulu, gercekci gorunumlu
- **key tespiti** - progression'a bakip otomatik key buluyor
- **scale onerileri** - pentatonik, blues, dogal minor/major arasinda sec
- **15 fret scale haritasi** - sectigin scale'in tum notalari fretboard uzerinde
- **tek tel melodi rehberi** - B + e teli uzerinde her akor icin ayri harita
- **nota analizi** - her scale notasinin ne ise yaradigini, hangi akorda bulundugunu acikliyor
- **lick kutuphanesi** - key'e gore hazir lick'ler, her akor icin transpose edilmis tab'larla
- **solo tuyolari** - kulaktan cikarma, bend pozisyonlari, akor gecis teknikleri

## nasil calistirilir

`index.html` dosyasini tarayicida ac. bitti.

framework yok, build yok, npm yok, dependency yok. tek dosya.

## github pages

1. bu repo'yu fork'la veya clone'la
2. settings > pages > source: main branch, root
3. `kullaniciadin.github.io/powerchord` adresinden kullan

## ekran goruntuleri

akorlari girince power chord tab'lari yan yana cikiyor:

```
    Am5    Dm5    Em5    C5
e | - x -|- x -|- x -|- x -|
B | - x -|- x -|- x -|- x -|
G | - x -|- x -|- x -|- x -|
D | - 7 -|- 7 -|- 2 -|- 5 -|
A | - 5 -|- 5 -|- 0 -|- 3 -|
E | - 5 -|- 5 -|- 0 -|- 3 -|
```

ust 3 tel bos. solo icin orasi senin.

## desteklenen akorlar

major, minor, 7'li, diyez, bemol hepsi var:

```
C D E F G A B
Cm Dm Em Fm Gm Am Bm
C# D# F# G# A# (ve Db Eb Gb Ab Bb)
C#m D#m F#m G#m A#m (ve Bbm Ebm Abm Dbm)
C7 D7 E7 F7 G7 A7 B7
```

power chord'da major/minor farki yok (3rd olmadigi icin). ama key tespiti icin onemli, scale onerileri ona gore degisiyor.

## lick kutuphanesi

minor key icin 6, major key icin 6 hazir lick var. kategoriler:

- **temel** - pentatonik acilis, inis kaliplari
- **bend** - blues bend, bend & release
- **slide** - giris slide'lari
- **melodik** - call & response, double stop
- **bitis** - vibrato kapanisi, cozum

her lick progression'daki her akor icin ayri fret numaralariyla gosteriliyor. yani Am'deki lick'in Dm versiyonunu da goruyorsun, ezberlemen gerekmiyor.

## teknik notasyon

tab'larda kullanilan semboller:

| sembol | anlami |
|--------|--------|
| `h` | hammer-on |
| `/` | slide yukari |
| `\` | slide asagi |
| `b` | bend |
| `~` | vibrato |
| `...` | bekleme |

## dark mode

sistem ayarina gore otomatik gecis yapiyor. ayri buton yok.

## katki

pull request acabilirsin. ozellikle su konularda yardim ise yarar:

- yeni lick'ler (ozellikle blues, funk, metal turleri icin)
- sus4, dim, aug gibi akor tipleri
- drop D tuning destegi
- mobil gorunum iyilestirmeleri

## lisans

MIT. istedigin gibi kullan.