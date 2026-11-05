import db from "#db";
import stringSimilarity from 'string-similarity';

// ========== BASE DE DATOS DE PELÍCULAS CON IMÁGENES ==========
const movies = {
  // ===== SERIES =====
  "el mentalista": {
    title: "El Mentalista (T1)",
    url: "https://es.cuevana4br.com/es/detail/drama/TuPRcG1aDXlnKO2vn9M67-The-Mentalist-Season-1",
    image: "https://pics.filmaffinity.com/El_mentalista_Serie_de_TV-184904864-large.jpg",
    type: "serie"
  },
  "the originals": {
    title: "The Originals (T3)",
    url: "https://video.playspelis.com/es/detail/drama/HPvmpcHWI9wpDbQGWIvza-The-Originals-Season-3",
    image: "https://fotografias.antena3.com/clipping/cmsimages01/2019/04/05/252F45EA-AF72-41EE-A0D4-7F81D2C5B389/69.jpg?crop=1280,720,x0,y0&width=1280&height=720&optimize=low&format=jpg",
    type: "serie"
  },
  "merlina": {
    title: "Merlina (T1)",
    url: "https://video.playspelis.com/es/detail/drama/j5LWeaJpNFW159I98DsqD-Wednesday-Season-1",
    image: "https://clxicons.com/wp-content/uploads/2025/08/Que-paso-en-Merlina-Temporada-1-Todo-lo-que-debes-saber-antes-de-ver-la-segunda.jpg",
    type: "serie"
  },
  "the purge": {
    title: "The Purge (T1)",
    url: "https://es.cuevana4br.com/es/detail/drama/cq2m20AetGXe4dgXn54YJ-The-Purge-Season-1",
    image: "https://s3.amazonaws.com/dam.smashmexico.com.mx/wp-content/uploads/2024/01/la-purga-the-purge-como-ver-orden-cronologico.jpg",
    type: "serie"
  },
  "from": {
    title: "From (T1)",
    url: "https://latino.solo-latino.com/es/detail/drama/v3HBgSbGMGBfDZO6EzXza-From-Season-1",
    image: "https://hips.hearstapps.com/hmg-prod/images/from-temporada-2-649ec0a7cb33a.jpg?crop=1xw:0.845427435387674xh;center,top&resize=1200:*",
    type: "serie"
  },
  "from t2": {
    title: "From (T2)",
    url: "https://video.playspelis.com/es/detail/drama/5D00Ra6GMcEITfE8DfE2d-From-Season-2",
    image: "https://hips.hearstapps.com/hmg-prod/images/from-temporada-2-649ec0a7cb33a.jpg?crop=1xw:0.845427435387674xh;center,top&resize=1200:*",
    type: "serie"
  },
  "from t3": {
    title: "From (T3)",
    url: "https://play.cuevana.life/es/detail/drama/wsUcgDlN09vM0f3AUIoJD-From-Season-3",
    image: "https://hips.hearstapps.com/hmg-prod/images/from-temporada-2-649ec0a7cb33a.jpg?crop=1xw:0.845427435387674xh;center,top&resize=1200:*",
    type: "serie"
  },
  "from t4": {
    title: "From (T4)",
    url: "https://ww20.321moviesfree.com/es/detail/drama/8JsoLCi6DNWXexKol4WnR-From-Season-4",
    image: "https://hips.hearstapps.com/hmg-prod/images/from-temporada-2-649ec0a7cb33a.jpg?crop=1xw:0.845427435387674xh;center,top&resize=1200:*",
    type: "serie"
  },
  "miraculous 6": {
    title: "Miraculous 6",
    url: "https://latino.solo-latino.com/es/detail/drama/6di6atgHQvKjbAkhnsDDY-Miraculous-Tales-of-Ladybug--Cat-Noir-Season-6",
    image: "https://i.ytimg.com/vi/aqIK8fsEcVY/maxresdefault.jpg",
    type: "serie"
  },
  "cassandra": {
    title: "Cassandra",
    url: "https://video.playspelis.com/es/detail/drama/FBYOgc18fne4QiM6P9rxx-Cassandra",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSahsX4IO4XxyxwqI6h0bQKaticeRCyhXXPQ1oGN6NmnucvBwemtVEkNRkI&s=10",
    type: "serie"
  },

  // ===== PELÍCULAS =====
  "spider-man sin camino a casa": {
    title: "🕷️ Spider-Man: Sin camino a casa",
    url: "https://play.cuevana.life/es/detail/movie/mMtxCySrAv62Pou8OY32l-Spider-Man-No-Way-Home",
    image: "https://disney.images.edge.bamgrid.com/ripcut-delivery/v2/variant/disney/019b29a9-3cf3-7339-ad8e-513baa325095/compose?format=webp&width=2560"
  },
  "spider-man across the spider-verse": {
    title: "🕷️ Across the Spider-Verse",
    url: "https://es.cuevana4br.com/es/detail/movie/sPOK62Ynj684BOtt3TybZ-Spider-Man-Across-the-Spider-Verse",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQu1anYbL7KBmxwxEFKZlPIWlFibVB9tz872XHJvxTm3r_L9h1z63ABvCI&s=10"
  },
  "shrek": {
    title: "🧚 Shrek",
    url: "https://ww20.321moviesfree.com/es/detail/movie/GYCE7CN7NaKvd1HLQkALS-Shrek-1",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxz3iNjPh41-7wtHfU8XLhqeomCbYwMkoKZ3boUGlChRz6R95FKRcmNRDk&s=10"
  },
  "shrek 2": {
    title: "🧚 Shrek 2",
    url: "https://video.playspelis.com/es/detail/movie/tL0vvE124qUEYQiXJP6BO-Shrek-2",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHtn8Je06AiS4OrFIZKteskLn3GB_BgKqy2MwIBNiTToNISmZEu79N-KTA&s=10"
  },
  "shrek 3": {
    title: "🧚 Shrek 3",
    url: "https://www3.dramasfree.com/es/detail/movie/dhKJjyRSBB8OsfOMBDx8M-Shrek-the-Third",
    image: "https://images.mubicdn.net/images/film/8790/cache-11430-1745489624/image-w1280.jpg?size=800x"
  },
  "shrek 4": {
    title: "🧚 Shrek 4: Felices para siempre",
    url: "https://flixlat.com/es/detail/movie/KbBstwx247XkFI9FFX1Ws-Shrek-4",
    image: "https://cloudfront-us-east-1.images.arcpublishing.com/abccolor/NNK5JZWQF5B4XOWMNR6W6N2IVA.jpg"
  },
  "harry potter y la piedra filosofal": {
    title: "⚡ Harry Potter y la piedra filosofal",
    url: "https://es.cuevana4br.com/es/detail/movie/MnPWUfrY9W6hT56Qlqy4P-Harry-Potter-and-the-Sorcerers-Stone",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9rA-suU-lVVA6nEeUpTavdbe1bCnvhvxlFTa1BeGStB-90urewHIvMExo&s=10"
  },
  "harry potter y la cámara secreta": {
    title: "⚡ Harry Potter y la cámara secreta",
    url: "https://video.playspelis.com/es/detail/movie/7IGD9nHAxejzYstx8oauA-Harry-Potter-and-the-Chamber-of-Secrets",
    image: "https://m.media-amazon.com/images/S/pv-target-images/b283611632325363f0860e8ff884645765177968e6c1908df707048d0c31b588._SX1080_FMjpg_.jpg"
  },
  "harry potter y el prisionero de azkaban": {
    title: "⚡ Harry Potter y el prisionero de Azkaban",
    url: "https://play.cuevana.life/es/detail/movie/Lx07zhenmquqkwnRIaX43-Harry-Potter-and-the-Prisoner-of-Azkaban",
    image: "https://megustaelcine.com/wp-content/uploads/2024/06/Harry-Potter-3-1.jpg"
  },
  "harry potter y el cáliz de fuego": {
    title: "⚡ Harry Potter y el cáliz de fuego",
    url: "https://es.cuevana4br.com/es/detail/movie/5PSbbDMj2q0fMrUFqUl7h-Harry-Potter-and-the-Goblet-of-Fire",
    image: "https://hips.hearstapps.com/hmg-prod/images/dumbledore-harry-potter-el-caliz-de-fuego-650b3bca70df4.jpg?crop=0.75xw:1xh;center,top&resize=1200:*"
  },
  "harry potter y la orden del fénix": {
    title: "⚡ Harry Potter y la orden del Fénix",
    url: "https://www3.dramasfree.com/es/detail/movie/GH3Uf9dwLwcPBYa0UVDrt-Harry-Potter-and-the-Order-of-the-Phoenix",
    image: "https://imagenes.20minutos.es/files/image_640_auto/uploads/imagenes/2022/07/16/harry-potter-y-la-orden-del-fenix-2007-11.jpeg"
  },
  "harry potter y el misterio del príncipe": {
    title: "⚡ Harry Potter y el misterio del príncipe",
    url: "https://ver.123pelicula.com/es/detail/movie/SJfkmmdAfMXm35sriguDA-Harry-Potter-and-the-Half-Blood-Prince",
    image: "https://occ-0-8407-114.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABTynjP3yLojCjCLdbcmb-L_3MFug8kY73RCyrZlatkI44N1d3com7I7TDjqb8hwHMcyWpJg4gSSGyaH6XISTORjr8lmgg3TVHYkJ.jpg?r=4a8"
  },
  "harry potter y las reliquias de la muerte parte 1": {
    title: "⚡ Harry Potter y las reliquias de la muerte (Parte 1)",
    url: "https://play.cuevana.life/es/detail/movie/UCV40uuETMLjTemd6EAkj-Harry-Potter-and-the-Deathly-Hallows-Part-1",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTarofPW-eFi_uhvVGMLIaF34GDHRfXeKbaw1z64mGZc5sR7LwpYfYaaNA&s=10"
  },
  "harry potter y las reliquias de la muerte parte 2": {
    title: "⚡ Harry Potter y las reliquias de la muerte (Parte 2)",
    url: "https://es.cuevana4br.com/es/detail/movie/PH8TgYolOk8zn1gvDTllG-Harry-Potter-and-the-Deathly-Hallows-Part-2",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMvO0iGLNMgAVdk5NztngjSRzCicsXuu1U_PTr5YKyNSkCJPSPlkyholA&s=10"
  },
  "donde están las rubias": {
    title: "👯 Donde están las rubias",
    url: "https://www3.dramasfree.com/es/detail/movie/6AWoQRYo5hNh5YsCGoCym-White-Chicks",
    image: "https://images.mubicdn.net/images/film/37096/cache-26971-1745490171/image-w1280.jpg?size=800x"
  },
  "king kong": {
    title: "🦍 King Kong",
    url: "https://ver.123pelicula.com/es/detail/movie/JTvoQuLUeUj46kaAYwgcJ-King-Kong",
    image: "https://www.abc.com.py/resizer/v2/https%3A%2F%2Farc-anglerfish-arc2-prod-abccolor.s3.amazonaws.com%2Fpublic%2FXVKTAPPJENH7ZLMGAFBSH2A5YU.jpg?auth=92dfc7cafd167c03f77e3fc3d1e9288d34c55199e23d7739628ccd933685194a&width=1920&smart=true"
  },
  "moana live action": {
    title: "🌊 Moana (Live Action)",
    url: "https://play.cuevana.life/es/detail/movie/dGWohgBn4Hm9pf9yyOcVc-Moana",
    image: "https://cnbl-cdn.bamgrid.com/assets/8ca59ca1aa1cd2d7e9d6d6b4fae341a75076ae2fa941b5ee8375ddbb46e258db/original"
  },
  "godzilla vs kong": {
    title: "🦎 Godzilla vs Kong",
    url: "https://ww1.123flmsfree.com/es/detail/movie/r2C3s7qjuMCcX2aNXUXmi-Godzilla-vs-Kong",
    image: "https://i.blogs.es/f7a706/godzilla-vs-kong/1366_2000.jpg"
  },
  "las ovejas detectives": {
    title: "🐑 Las ovejas detectives",
    url: "https://ver.123pelicula.com/es/detail/movie/3cq8RA7W579HKWvzpDhEJ-The-Sheep-Detectives",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFPjArGf4DoU1NjUWFfLd3Kg9H_m3ZhbPBYmB82lxG9LqjDmzFk37_L-LFbZ2WTUOchipNC0v3ybknJfhCovU9r422370YBRQNnwk6Zw&s=10"
  },
  "corporate retreat": {
    title: "🏢 Corporate Retreat",
    url: "https://play.cuevana.life/es/detail/movie/bbUp1M7Vi62k29iyBIhx3-Corporate-Retreat",
    image: "https://cdn.prod.website-files.com/5c729f15fd0819dbaf8e66c6/638e5abfb5884073203d791d_Mount-Lofty-House%20(1).jpeg"
  },
  "strung": {
    title: "🎸 Strung",
    url: "https://www3.dramasfree.com/es/detail/movie/TeQhq046yMeyHVSJFuVFU-Strung",
    image: "https://static01.nyt.com/images/2026/06/26/multimedia/26cul-strung-review-tkcq/26cul-strung-review-tkcq-articleLarge.jpg?quality=75&auto=webp&disable=upscale"
  },
  "backwoods blood feud": {
    title: "🔪 Backwoods Blood Feud",
    url: "https://latino.solo-latino.com/es/detail/movie/xX0AvCZddOYBP6Ph9GO2z-Backwoods-Blood-Feud",
    image: "https://m.media-amazon.com/images/M/MV5BZTM2ODE5MzItMWQ4NC00NDYzLWJjYjMtNTYwMDcxOWUwOGJlXkEyXkFqcGc@._V1_.jpg"
  },
  "supergirl": {
    title: "🦸 Supergirl",
    url: "https://ver.123pelicula.com/es/detail/movie/EZLC1KgqiOOZuezJgXlHd-Supergirl-Woman-of-Tomorrow",
    image: "https://m.media-amazon.com/images/M/MV5BY2FkNDhhMzItM2JjMi00ODEwLWEzYjgtNmMzN2ZhODkxOWQ2XkEyXkFqcGdeQWFybm8@._V1_.jpg"
  },
  "la invitación": {
    title: "📩 La invitación",
    url: "https://peliculaplay.com/es/detail/movie/qGfsKmcBgxieiQX7KlKTZ-The-Invite",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-rywgvpuRD8nR5FBeilF6Af-DRx1_LB0fsfMX8GLn00ahzvWj0WQr1Bo&s=10"
  },
  "alerta extinción": {
    title: "⚠️ Alerta Extinción",
    url: "https://ver.123pelicula.com/es/detail/movie/XT6YWTS9m1DQsqB6oGQ4q-Cold-Storage",
    image: "https://m.media-amazon.com/images/S/pv-target-images/acff787a9c51759c3c7fefc4e28e1aebb14347fc2fb46f9c04aff10f2b16bb59._SX1080_FMpng_.png"
  },
  "wormtown": {
    title: "🐛 WormTown",
    url: "https://play.cuevana.life/es/detail/movie/UFEhST5wCAg2IeRz7S8ep-Wormtown",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxiOSuG8aNQIvQr0TgOOnNeeQfat_pq-2_HKAuDvq7S-s6YQWDE3woMgnH&s=10"
  },
  "exterminio el templo de los huesos": {
    title: "💀 Exterminio: El templo de los huesos",
    url: "https://ww20.321moviesfree.com/es/detail/movie/YB8nbAjwPHSiwGP4aCLNQ-28-Years-Later-The-Bone-Temple",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrI0lpHobFiNjF-u64KTpROl_ZThC7Gh_NKh8_sffzPpKH0eJcIW2qZf18&s=10"
  },
  "la vida de pi": {
    title: "🐯 La vida de Pi",
    url: "https://peliculaplay.com/es/detail/movie/M52ADxaTPhQFGp8n1hjmz-Life-of-Pi",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7Va_RKkQ4Y6GbnnSLjjyIycvb-WHd3lo3J5TBYds8AQn91QQnYuXkOWrT&s=10"
  },
  "minions & monster": {
    title: "🍌 Minions & Monster",
    url: "https://ww20.321moviesfree.com/es/detail/movie/oJZ3yfNqc8s93g6h0eez3-Minions--Monsters",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQofUXR_yUVyqhehzVpFkVo7INNLDXLztVTBktS7UqP7vMerFcSz2rsTtsZ&s=10"
  },
  "obsession": {
    title: "❤️ Obsession",
    url: "https://ww1.123flmsfree.com/es/detail/movie/81NqnKUKqaVF41lZfLlZ7-Obsession",
    image: "https://m.media-amazon.com/images/S/pv-target-images/994789a22b07820e60a905f7e4dec1235c621b0c013bdc0e0baa57da4376ac2c._SX1080_FMjpg_.jpg"
  },
  "la posesión de la momia": {
    title: "🧟 La posesión de la Momia",
    url: "https://video.playspelis.com/es/detail/movie/ORMRWcEwY5HMWMj2FzTaA-Lee-Cronins-The-Mummy",
    image: "https://media.gq.com.mx/photos/696689cf26895c3cd18985ab/16:9/w_2560%2Cc_limit/La%2520Momia.jpg"
  },
  "legalmente rubia": {
    title: "💼 Legalmente Rubia",
    url: "https://ww20.321moviesfree.com/es/detail/movie/1nUQyIYrkfiSadeBTRb39-Legally-Blonde",
    image: "https://m.media-amazon.com/images/S/pv-target-images/2ce695ac967ab3b7ca59abb6db4b757b1f1d3c9e2fd5113ff4acd100569c13ae._SX1080_FMjpg_.jpg"
  },
  "chum": {
    title: "🦈 Chum",
    url: "https://www3.dramasfree.com/es/detail/movie/f9791qvq497yEf1TepeGY-Chum",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTn3yPyLqkdyncLB0Swxfexnq3EU09n--M6axKrhIlMOGkXVwBPwQ9Jrpk&s=10"
  },
  "50 sombras de grey": {
    title: "🌹 50 Sombras de Grey",
    url: "https://peliculaplay.com/es/detail/movie/iLibJLOCwnyiVu97q9K0B-Fifty-Shades-of-Grey",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScpe6ncjHtC9tAJcPCZf5lDhL3O8OgFI5P6F66xq1TNbbTJGI-aiEkvYe5&s=10"
  },
  "te van a matar": {
    title: "🔪 Te van a matar",
    url: "https://ver.123pelicula.com/es/detail/movie/Q7lhrLfF1keGQmZEmAsDP-They-Will-Kill-You",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0ZSfGnY5VAcIC0AiTQGXaH44z59n43EttRqpc_eUV3s3XytB_m-ozDJsX&s=10"
  },
  "enola holmes": {
    title: "🔍 Enola Holmes",
    url: "https://video.playspelis.com/es/detail/movie/H11bhsHeEElhMh8pFAJ6i-Enola-Holmes",
    image: "https://occ-0-8407-1001.1.nflxso.net/dnm/api/v6/9pS1daC2n6UGc3dUogvWIPMR_OU/AAAABQd0_bxda3LDRRAD0kvd3Ffyo7re6xiMBdhiH01nF3X5-9IkRxKN32gw34rVG3eB4nWJJ-ED5f95ariyFoBuR6H8HmcwtQ5wETa5zJgVV0RkfW8F_dNRP7DuZg.jpg?r=0c0"
  },
  "enola holmes 2": {
    title: "🔍 Enola Holmes 2",
    url: "https://ww1.123flmsfree.com/es/detail/movie/2Y6xJc8UPCmtBrGQ5nHI6-Enola-Holmes-2",
    image: "https://m.media-amazon.com/images/M/MV5BZjZjMGUyNTgtNWE2Yi00YTAyLTg5ZTMtYTVkMmNkNGFmMTRiXkEyXkFqcGdeQWFkcmllY2xh._V1_.jpg"
  },
  "enola holmes 3": {
    title: "🔍 Enola Holmes 3",
    url: "https://www3.dramasfree.com/es/detail/movie/4C2qIVp2Q5F2KpgJpb7lH-Enola-Holmes-3",
    image: "https://s.yimg.com/ny/api/res/1.2/CFffImwyrVU5sUyJunE0dQ--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyNDI7aD03MzA7Y2Y9d2VicA--/https://media.zenfs.com/es/la_republica_articles_761/01e479b497c5919cc84a6d2f581c5ed3"
  },
  "backrooms": {
    title: "🚪 Backrooms",
    url: "https://play.cuevana.life/es/detail/movie/jMCA2ZTBl5RdjojwQW1PM-Backrooms",
    image: "https://media.gq.com.mx/photos/69a19d9de01d346af41238cc/16:9/w_2560%2Cc_limit/Backrooms.jpg"
  },
  "five nights at freddys": {
    title: "🐻 Five Nights at Freddy's (2023)",
    url: "https://play.cuevana.life/es/detail/movie/UYbywBL7C14A5zAr5AzcS-Five-Nights-At-Freddys",
    image: "https://www.billboard.com/wp-content/uploads/2023/10/five-nights-at-freddys-2023-billboard-1548.jpg"
  },
  "five nights at freddys 2": {
    title: "🐻 Five Nights at Freddy's 2",
    url: "https://latino.solo-latino.com/es/detail/movie/QyFLAM7pTw8mzvuli420k-Five-Nights-At-Freddys-2",
    image: "https://m.media-amazon.com/images/M/MV5BM2E0NjViODYtZjk3ZS00MzI5LTk1NTctNWQ3MDZjNWNiY2E3XkEyXkFqcGc@._V1_.jpg"
  },
  "intensamente 2": {
    title: "🧠 Intensamente 2",
    url: "https://ww20.321moviesfree.com/es/detail/movie/5zOdq75PrEJYxX8Pm2bAw-Inside-Out-2",
    image: "https://megustaelcine.com/wp-content/uploads/2024/06/Intensamente-2-1.jpeg"
  },
  "avatar el sentido del agua": {
    title: "🌊 Avatar: El sentido del agua",
    url: "https://video.playspelis.com/es/detail/movie/6I7u7wYHj4HIBuwgohTYS-Avatar-The-Way-of-Water",
    image: "https://i0.wp.com/www.ciencia-ficcion.com/cine/img2022/avatar02.jpg"
  },
  "cars": {
    title: "🚗 Cars",
    url: "https://video.playspelis.com/es/detail/movie/KDxG7OQihJJsd9SXy24yp-Cars",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNTb_ZKnAjhe39UgJKMpGLCSMTUCWYGeiSKhy1vhvI2kCqCwK-yvANnQqu&s=10"
  },
  "kung fu panda": {
    title: "🐼 Kung Fu Panda (2008)",
    url: "https://ww20.321moviesfree.com/es/detail/movie/VFlMETfaVjEWump0ytHjd-Kung-Fu-Panda",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdt7CUJBJw_0lIzy-vnj3OqKc9ojRmxO2mLBxOlNMGrt3Pxlbl8Xxx65A&s=10"
  },
  "el conjuro": {
    title: "👻 El Conjuro",
    url: "https://ver.123pelicula.com/es/detail/movie/ffz7uuSSVGduhexvYi3PT-The-Conjuring",
    image: "https://hips.hearstapps.com/hmg-prod/images/the-conjuring-house-exterior-640b0ba8d0674.jpg"
  },
  "la sustancia": {
    title: "🧪 La Sustancia (2024)",
    url: "https://play.cuevana.life/es/detail/movie/6sRswmczORzjTeHdRH0ee-The-Substance",
    image: "https://ichef.bbci.co.uk/ace/ws/640/cpsprodpb/37e0/live/0d33ac10-f5e9-11ef-9e7b-21c750c82d19.png.webp"
  },
  "minecraft": {
    title: "⛏️ Minecraft (2025)",
    url: "https://video.playspelis.com/es/detail/movie/PI97tF4VKHGs7NkDVVnLR-A-Minecraft-Movie",
    image: "https://i.blogs.es/6554f1/miencraft-pelicula/500_333.jpeg"
  },
  "interstellar": {
    title: "🚀 Interstellar (2014)",
    url: "https://ww20.321moviesfree.com/es/detail/movie/bTfmR7SjycdIeayEJPdeq-Interstellar",
    image: "https://i.ytimg.com/vi/LYS2O1nl9iM/hq720.jpg"
  },
  "toy story 1": {
    title: "🧸 Toy Story 1 (1995)",
    url: "https://es.cuevana4br.com/es/detail/movie/QsuHEb8AU6FC9ndjBx6ED-Toy-Story-1",
    image: "https://megustaelcine.com/wp-content/uploads/2025/09/Toy-Story-1995-5-1024x683.jpg"
  },
  "toy story 5": {
    title: "🧸 Toy Story 5",
    url: "https://video.playspelis.com/es/detail/movie/yN0aGFrdc4n4TsPf0wZ5C-Toy-Story-5",
    image: "https://estaticos-cdn.prensaiberica.es/clip/30d95a69-70d3-487a-b6bb-65a220eaffb5_16-9-discover-aspect-ratio_default_0_x1080y388.jpg"
  },
  "intercambio": {
    title: "🔄 Intercambio",
    url: "https://ww20.321moviesfree.com/es/detail/movie/o05HFJ82mOEYEuwbPeMhF-Swapped",
    image: "https://static01.nyt.com/images/2026/05/01/multimedia/01cul-swapped-review1-bklq/01cul-swapped-review1-bklq-articleLarge.jpg?quality=75&auto=webp&disable=upscale"
  },
  "flow": {
    title: "🌊 Flow",
    url: "https://flixlat.com/es/detail/movie/3EmtD7NC7w4FOvs1QanXb-Flow",
    image: "https://cdn.elfarandi.com/wp-content/uploads/2025/02/flow-entrevista-2.webp"
  },
  "hoppers": {
    title: "🐰 Hoppers",
    url: "https://www3.dramasfree.com/es/detail/movie/drHHSEoReio5Ntozg0p3I-Hoppers",
    image: "https://m.media-amazon.com/images/M/MV5BZjY0N2FmYmEtMGZjNC00MTBjLTkyY2ItNjgwMjE5ZDUwYjdlXkEyXkFqcGdeQVRoaXJkUGFydHlJbmdlc3Rpb25Xb3JrZmxvdw@@._V1_QL75_UX500_CR0,0,500,281_.jpg"
  },
  "moana": {
    title: "🌊 Moana",
    url: "https://latino.solo-latino.com/es/detail/movie/Wt0CMHAnaGOZ7RxIiqdcY-Moana",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKTYKHDsGiIUsr8XHLdxxMFtU3DpOzSHseroC6XA7_SMe4ry5Vvb0Ree8&s=10"
  },
  "fast and furious 1": {
    title: "🏎️ Fast And Furious 1",
    url: "https://es.cuevana4br.com/es/detail/movie/XADcAL21CyH6QcPuLjnSV-The-Fast-and-the-Furious",
    image: "https://m.media-amazon.com/images/M/MV5BMTQ2NDczNzAwNF5BMl5BanBnXkFtZTgwMTA2NzUwOTE@._V1_.jpg"
  },
  "super mario galaxy": {
    title: "🍄 Super Mario Galaxy",
    url: "https://ww20.321moviesfree.com/es/detail/movie/WontRDJoNb9FigkbJWBUq-The-Super-Mario-Galaxy-Movie",
    image: "https://www.denofgeek.com/wp-content/uploads/2025/11/Rosalina-Super-Mario-Galaxy-Movie.png?resize=768%2C432"
  },
  "zootopia 2": {
    title: "🐰 Zootopia 2",
    url: "https://es.cuevana4br.com/es/detail/movie/OmKA0o94bf16x4RsPNud1-Zootopia-2",
    image: "https://statcdn.fandango.com/MPX/image/NBCU_Fandango/514/639/thumb_74C7AB2A-1E02-4104-AA36-6D7FCFC2046C.jpg"
  },
  "kpop demon hunters": {
    title: "🎤 Kpop Demon Hunters",
    url: "https://ver.123pelicula.com/es/detail/movie/dUcNtPZ10VrGovtl6Ei4Q-KPop-Demon-Hunters",
    image: "https://es.hollywoodreporter.com/wp-content/uploads/2025/07/El-fenomeno-global-de-KPop-Demon-Hunters-trasciende-la-pantalla.jpg"
  },
  "garfield 2": {
    title: "🐱 Garfield 2",
    url: "https://ww20.321moviesfree.com/es/detail/movie/IEG509OTPzI4AhsH7dVhM-Garfield-A-Tail-of-Two-Kitties",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwAPaBt8lhwbTtC5Ly12rqPjOQOCwC06pUa4B9d5juP2sv_0VLFNVKMqo&s=10"
  },
  "us": {
    title: "👪 Us",
    url: "https://es.cuevana4br.com/es/detail/movie/rmjuxLx8jiLuyWv0FJMdV-Us",
    image: "https://media.gq.com.mx/photos/5c992ecccb60c0d1f9ade41e/master/pass/us.jpg"
  },
  "michael jackson": {
    title: "🎤 Michael Jackson",
    url: "https://ww20.321moviesfree.com/es/detail/movie/qztQ1T9u5SsDb7fkzVD3D-Michael",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpZRMEXjHdwi4FsMpyPLkiBHVeuMltqUv8mnS7gjC8BxkNgf_uK751222S&s=10"
  },
  "duck duck goose": {
    title: "🦆 Duck Duck Goose",
    url: "https://es.cuevana4br.com/es/detail/movie/8GNH9uG44vzxBbyd8D03e-Duck-Duck-Goose",
    image: "https://statcdn.fandango.com/MPX/image/NBCU_Fandango/207/334/thumb_47795138-BFD6-4A78-878A-66C62EDA020E.jpg"
  },
  "elio": {
    title: "👽 Elio",
    url: "https://play.cuevana.life/es/detail/movie/ixNkQTutut7SZNKZIc2Ul-Elio",
    image: "https://es.hollywoodreporter.com/wp-content/uploads/2025/06/Elio.jpg"
  },
  "el ritual del nahual": {
    title: "🔥 El ritual del nahual",
    url: "https://play.cuevana.life/es/detail/movie/ANM5QDEZMiuKRvz0jGohJ-TEKENCHU-THE-RITE-OF-THE-NAHUALES",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxnx4Q2bJTnUsMQYEjBGwL8VG-wq1BpqVSGN1e5OhmHU_Gv-LUt_xrcicS&s=10"
  },
  "embestida": {
    title: "💥 Embestida",
    url: "https://flixlat.com/es/detail/movie/nnzUvXldjywuQKuyLSl11-Thrash",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe2io_uYTQJZeCB5Aj31CHt-FfRxe05Yp3P4LHFCda6GI9qT6zBV9kBRo&s=10"
  },
  "stuart little": {
    title: "🐭 Stuart Little",
    url: "https://peliculaplay.com/es/detail/movie/s4dW1eeeK6HAYLEUer9F5-Stuart-Little-1",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1qi-mAJ8Zzk8ga0Ok0kLFqleIheT2ePLhSVJ9xnucbgKvLqiocrs5Eo2g&s=10"
  },
  "un gran dinosaurio": {
    title: "🦕 Un gran dinosaurio",
    url: "https://video.playspelis.com/es/detail/movie/EqJnRCPzFNDNlq82T1enM-The-Good-Dinosaur",
    image: "https://statcdn.fandango.com/MPX/image/NBCU_Fandango/748/607/TheGoodDinosaur_20YearsTrailer.jpg"
  },
  "mamá": {
    title: "👩 Mamá",
    url: "https://es.cuevana4br.com/es/detail/movie/UaZxWV4wht1be5VNqgrj4-Mama",
    image: "https://m.media-amazon.com/images/M/MV5BMTUzODU4MTYwOV5BMl5BanBnXkFtZTgwMDY5NDkyMzE@._V1_.jpg"
  },
  "it": {
    title: "🎈 IT",
    url: "https://www3.dramasfree.com/es/detail/movie/TL9fg2TEFkYy6UE4qo2kh-It-Chapter-One",
    image: "https://ichef.bbci.co.uk/ace/ws/640/cpsprodpb/66D3/production/_98032362_mediaitem98014584.jpg.webp"
  },
  "fall": {
    title: "📱 Fall",
    url: "https://flixlat.com/es/detail/movie/HGsEo12DCkUvSm37QjPmn-Fall",
    image: "https://m.media-amazon.com/images/M/MV5BZmY5MjRjY2ItMzFmOC00NjAyLTg2MGYtYmQxZmMwNDYwOGFhXkEyXkFqcGc@._V1_.jpg"
  },
  "el laberinto del fauno": {
    title: "🧚 El laberinto del fauno",
    url: "https://flixlat.com/es/detail/movie/V9UDU2L7EQ9ecVrHpYSXh-Pans-Labyrinth",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4B_y_zJZNzCh4WYCON3pptxVipd5e5o0mWXFwX3LKrd7kc7RIUVt2uIM&s=10"
  },
  "matrix": {
    title: "💊 Matrix",
    url: "https://ww20.321moviesfree.com/es/detail/movie/xdxYYCIesNjd8F3OIETwx-The-Matrix",
    image: "https://m.media-amazon.com/images/M/MV5BNzM4OTkzMjcxOF5BMl5BanBnXkFtZTgwMTkxMjI1MTI@._V1_.jpg"
  },
  "ready or not 2": {
    title: "🎲 Ready or Not 2",
    url: "https://es.cuevana4br.com/es/detail/movie/Scen4HIQ82DEwa1aXDYgf-Ready-or-Not-2-Here-I-Come",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmeZry935U8HVbxAzXNKBZsKh9FTuFXiiGPayunZ7YrWVwT2_d7YrnG41o&s=10"
  },
  "sueño de fuga": {
    title: "🔒 Sueño de fuga",
    url: "https://play.cuevana.life/es/detail/movie/ETRCPqhmI1ut2TExltM6u-The-Shawshank-Redemption",
    image: "https://m.media-amazon.com/images/M/MV5BMTQ5NTI4NDAxMV5BMl5BanBnXkFtZTgwMTQxNDY3Mw@@._V1_.jpg"
  }
};

// ========== COMANDO CON IMÁGENES ==========
export default {
  command: ['movie', 'pelicula', 'pelis', 'verp'],
  category: 'util',
  description: '🎬 Buscar y ver películas con imagen',
  
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    try {
      // ========== SIN ARGUMENTOS ==========
      if (!args || args.length === 0) {
        const categories = {
          '🎬 Películas': [],
          '📺 Series': []
        };

        Object.values(movies).forEach(m => {
          if (m.type === 'serie') {
            categories['📺 Series'].push(m.title);
          } else {
            categories['🎬 Películas'].push(m.title);
          }
        });

        const movieList = categories['🎬 Películas'].slice(0, 15).map((t, i) => 
          `${i + 1}. ${t}`
        ).join('\n');
        
        const seriesList = categories['📺 Series'].slice(0, 10).map((t, i) => 
          `${i + 1}. ${t}`
        ).join('\n');

        return msg.reply(`🎬 *BIBLIOTECA DE PELÍCULAS Y SERIES*
╔══════════════════════════════════╗
║  📊 Total: ${Object.keys(movies).length} títulos  ║
╚══════════════════════════════════╝

📌 *Categorías disponibles:*

▸ *Películas* (${categories['🎬 Películas'].length})
${movieList}${categories['🎬 Películas'].length > 15 ? '\n... y más' : ''}

▸ *Series* (${categories['📺 Series'].length})
${seriesList}${categories['📺 Series'].length > 10 ? '\n... y más' : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *Uso:* ${usedPrefix}movie *nombre*

*Ejemplos:*
▸ ${usedPrefix}movie shrek
▸ ${usedPrefix}movie harry potter
▸ ${usedPrefix}movie spider-man
▸ ${usedPrefix}movie from`);
      }

      const searchTerm = args.join(' ').toLowerCase().trim();
      console.log(`🔍 Buscando: ${searchTerm}`);

      // ========== 1. COINCIDENCIA EXACTA ==========
      let foundMovie = movies[searchTerm];
      if (foundMovie) {
        return sendMovieCard(msg, sock, foundMovie);
      }

      // ========== 2. COINCIDENCIA PARCIAL ==========
      const keys = Object.keys(movies);
      for (const key of keys) {
        if (key.includes(searchTerm) || searchTerm.includes(key)) {
          foundMovie = movies[key];
          console.log(`✅ Encontrado por coincidencia parcial: ${key}`);
          return sendMovieCard(msg, sock, foundMovie);
        }
      }

      // ========== 3. FUZZY MATCHING ==========
      console.log('🔄 Intentando fuzzy matching...');
      
      const matches = keys.map(key => ({
        key: key,
        movie: movies[key],
        similarity: stringSimilarity.compareTwoStrings(searchTerm, key)
      }));

      matches.sort((a, b) => b.similarity - a.similarity);
      const bestMatch = matches[0];

      if (bestMatch && bestMatch.similarity >= 0.4) {
        console.log(`✅ Fuzzy match: "${searchTerm}" → "${bestMatch.key}" (${Math.round(bestMatch.similarity * 100)}%)`);
        return sendMovieCard(msg, sock, bestMatch.movie);
      }

      // ========== 4. SUGERENCIAS ==========
      const suggestions = matches
        .filter(m => m.similarity >= 0.25 && m.similarity < 0.4)
        .slice(0, 5);

      if (suggestions.length > 0) {
        const suggestionText = suggestions.map(s => 
          `▸ ${usedPrefix}movie ${s.key}`
        ).join('\n');

        return msg.reply(`❌ *No encontré* "${searchTerm}" 😅

*¿Quizás quisiste decir?* 🤔

${suggestionText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *Escribe el nombre completo o prueba con otra palabra.*`);
      }

      return msg.reply(`❌ *No encontré* "${searchTerm}" en la biblioteca. 😅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *Uso:* ${usedPrefix}movie *nombre*

*Ejemplos:*
▸ ${usedPrefix}movie shrek
▸ ${usedPrefix}movie harry potter
▸ ${usedPrefix}movie spider-man
▸ ${usedPrefix}movie from`);

    } catch (e) {
      console.error('❌ Error en movie:', e);
      await msg.reply(`❌ *Error:* ${e.message || 'Error desconocido'}`);
    }
  }
};

// ========== FUNCIÓN PARA ENVIAR TARJETA CON IMAGEN ==========
async function sendMovieCard(msg, sock, movie) {
  const type = movie.type || 'película';
  const isSerie = type === 'serie';
  
  const emoji = isSerie ? '📺' : '🎬';
  const typeLabel = isSerie ? 'SERIE' : 'PELÍCULA';

  // ========== ENVIAR CON IMAGEN ==========
  if (movie.image) {
    try {
      await sock.sendMessage(msg.chat, {
        image: { url: movie.image },
        caption: `${emoji} *${movie.title}*

┌─────────────────────────────┐
│ 📌 *Tipo:* ${typeLabel}     │
│ 🔗 *Enlace:* ${movie.url}   │
└─────────────────────────────┘

🔗 *Haz clic en el enlace para ver*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ *Hecho por Plevark Ecosystem* ✨`
      }, { quoted: msg });
    } catch (e) {
      // Si la imagen falla, enviar solo texto
      console.warn('⚠️ Error al enviar imagen:', e.message);
      await sock.sendMessage(msg.chat, {
        text: `${emoji} *${movie.title}*

┌─────────────────────────────┐
│ 📌 *Tipo:* ${typeLabel}     │
│ 🔗 *Enlace:* ${movie.url}   │
└─────────────────────────────┘

🔗 *Haz clic en el enlace para ver*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ *Hecho por Plevark Ecosystem* ✨`
      }, { quoted: msg });
    }
  } else {
    // Sin imagen, solo texto
    await sock.sendMessage(msg.chat, {
      text: `${emoji} *${movie.title}*

┌─────────────────────────────┐
│ 📌 *Tipo:* ${typeLabel}     │
│ 🔗 *Enlace:* ${movie.url}   │
└─────────────────────────────┘

🔗 *Haz clic en el enlace para ver*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ *Hecho por Plevark Ecosystem* ✨`
    }, { quoted: msg });
  }
}