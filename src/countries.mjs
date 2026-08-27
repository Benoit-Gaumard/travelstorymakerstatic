// Country pages. `match` maps to the tail of an entry's `place` field.
// `query` feeds the image fetcher in tools/fetch-assets.mjs.
export const COUNTRIES = [
  {
    slug: 'united-states', name: 'the United States', title: 'United States', match: ['USA'],
    query: 'grand canyon landscape',
    lede: 'A country you cannot see in one trip, and should stop trying to.',
    intro: '<p>The United States is less a destination than a shelf of them. The distance from Miami to Seattle is greater than London to Baghdad, and the country contains the hottest recorded air temperature on Earth, the deepest lake in North America, and a supervolcano that runs more than half the planet\'s geysers.</p><p>The entries below skew towards the parts that surprise people: the national park that was the world\'s first, the rocks that move across a dry lake by themselves, the state that is simultaneously the westernmost and easternmost in the union. If you are planning a route, the useful lesson is that Americans measure trips in driving hours, not kilometres, and they are usually right to.</p>',
  },
  {
    slug: 'australia', name: 'Australia', title: 'Australia', match: ['Australia'],
    query: 'uluru australia outback',
    lede: 'Wider than the Moon, emptier than almost anywhere, and stranger than its reputation.',
    intro: '<p>Australia is wider east to west than the Moon is across, holds roughly 10,000 beaches, and keeps the largest structure ever built by living organisms just off its northeast coast. Most visitors see the sliver between Sydney and Cairns and come home convinced they have seen the country.</p><p>What follows is a mix of the famous and the odd: why Uluru is mostly underground, why the outback has more feral camels than Arabia, why wombat droppings are cubes, and how a single fence long enough to reach from Berlin to Kabul shaped a whole agricultural economy. Distances are the recurring theme. Plan fewer stops than you think you need.</p>',
  },
  {
    slug: 'japan', name: 'Japan', title: 'Japan', match: ['Japan'],
    query: 'kyoto temple autumn',
    lede: 'An archipelago of 6,800 islands that treats punctuality as a form of politeness.',
    intro: '<p>Japan is an archipelago of more than 6,800 islands, though four of them carry almost the entire population. It also has more vending machines per head than anywhere else, a national forecast for cherry blossom, and a hotel that has been run by the same family since the year 705.</p><p>The entries here cover both the postcard and the practical: why Kyoto still has 1,600 temples, why the upper slopes of Mount Fuji are privately owned, what actually happens in a bathhouse before you get in the water, and why the last train home is a genuine social institution. If one idea runs through all of it, it is that Japanese travel rewards people who read the sign rather than the guidebook.</p>',
  },
  {
    slug: 'india', name: 'India', title: 'India', match: ['India'],
    query: 'taj mahal india',
    lede: 'Twenty-two official languages, 20 million rail passengers a day, and a different country every 300 kilometres.',
    intro: '<p>India recognises 22 official languages and counts more than 120 with over 10,000 speakers each. Its railways move over 20 million people a day across 68,000 kilometres of track, which makes the train less a way of getting somewhere than the single best place to understand the country.</p><p>Below you will find the Taj Mahal changing colour through the day, bridges in Meghalaya grown from living fig roots over decades, ferries in Kerala that double as school buses, and the moment on a Delhi street when crossing the road stops feeling like courage and starts feeling like grammar. India is not difficult. It is dense, which is a different thing.</p>',
  },
  {
    slug: 'canada', name: 'Canada', title: 'Canada', match: ['Canada'],
    query: 'canadian rockies lake',
    lede: 'More lake surface than the rest of the world combined, and a coastline longer than the next ten countries put together.',
    intro: '<p>Canada holds more lake area than every other country added together, and its coastline runs past 200,000 kilometres once the Arctic islands are counted. One national park is larger than Switzerland. One province runs half an hour offset from its neighbours for reasons dating to 1935.</p><p>The entries gathered here lean into that scale: the town where cars are left unlocked so people can hide from polar bears, the railway tunnels bored in a figure of eight to tame a mountain grade, the strategic maple syrup reserve that genuinely exists. The practical takeaway is that Canadian distances behave like Australian ones. Budget days, not hours.</p>',
  },
  {
    slug: 'new-zealand', name: 'New Zealand', title: 'New Zealand', match: ['New Zealand'],
    query: 'new zealand landscape',
    lede: 'The last large landmass humans settled, and the one where birds got there first.',
    intro: '<p>Polynesian navigators reached Aotearoa around 1300 AD, making it one of the last sizeable places on Earth that people settled. Because the only native land mammals were bats, birds filled almost every ecological role, which is why the country\'s wildlife still looks like an experiment run without cats.</p><p>The entries here include the fiord that is misnamed a sound and gets six metres of rain a year, the river granted legal personhood in 2017, the cave ceiling that looks like a star map and is in fact several thousand hungry larvae, and the bridge where commercial bungee jumping began. Hope for rain in Milford. Locals will tell you the same thing.</p>',
  },
  {
    slug: 'mexico', name: 'Mexico', title: 'Mexico', match: ['Mexico'],
    query: 'chichen itza mexico pyramid',
    lede: 'Sixty-eight recognised languages, a sinking capital, and the birthplace of chocolate.',
    intro: '<p>Alongside Spanish, Mexico officially recognises 68 indigenous languages with hundreds of variants. Its capital sits on a drained lakebed and subsides several centimetres a year. Cacao was drunk here, bitter and spiced, long before anyone in Europe thought to add sugar.</p><p>Below: the pyramid staircase where equinox shadows form a serpent, the ring of cenotes that traces the asteroid impact which ended the dinosaurs, the Day of the Dead as a reunion rather than a haunting, and the mole that takes three days and starts an argument about when the chocolate goes in. Mexico rewards eating on the street and asking what something is called.</p>',
  },
  {
    slug: 'italy', name: 'Italy', title: 'Italy', match: ['Italy'],
    query: 'venice italy canal',
    lede: 'More UNESCO World Heritage sites than any other country, and a city built on a petrified forest.',
    intro: '<p>Italy holds more World Heritage sites than anywhere else, from Roman ruins to entire mountain villages. Venice stands on millions of alder logs driven into lagoon mud that petrified instead of rotting. Pompeii has been dug for over 250 years and roughly a third is still deliberately buried, left for archaeologists with better tools.</p><p>The entries here include the coffee that costs one euro standing and three sitting, the alley that ends in water with no bridge, and the two hours in February when it snowed on the Forum and the whole city stopped. Italy is best travelled slowly and eaten standing up.</p>',
  },
  {
    slug: 'peru', name: 'Peru', title: 'Peru', match: ['Peru'],
    query: 'machu picchu peru',
    lede: 'Three thousand potato varieties, walls that survive earthquakes, and a citadel Spain never found.',
    intro: '<p>Peru cultivates more than 3,000 varieties of potato, a crop domesticated in the Andes roughly 8,000 years ago. Its Inca masonry fits without mortar and is engineered to shift and resettle during earthquakes rather than crack, which is a large part of why it is still standing.</p><p>Machu Picchu survived intact because the Spanish never located it. Below you will also find the desert figures at Nazca that only made sense once aircraft flew over them, the striped mountain revealed by a retreating glacier, the reed islands that move underfoot, and the rule about ceviche: anyone serving it in the evening is telling you something.</p>',
  },
  {
    slug: 'china', name: 'China', title: 'China', match: ['China'],
    query: 'great wall of china',
    lede: 'More high-speed rail than the rest of the world combined, and one time zone from end to end.',
    intro: '<p>China has laid more high-speed track than every other country put together, linking most major cities at 300 km/h. It also runs the entire country on Beijing time, which means the sun rises after ten in the morning in western Xinjiang.</p><p>The Great Wall is not one wall but a network built by different dynasties across 2,000 years, and long stretches are rammed earth rather than stone. The entries here also cover the terracotta army that was originally painted in bright colours, the airport maglev that covers 30 kilometres in seven and a half minutes, and the flooded rice terraces that turn a mountainside into a mirror for a few weeks each February.</p>',
  },
  {
    slug: 'morocco', name: 'Morocco', title: 'Morocco', match: ['Morocco'],
    query: 'chefchaouen morocco blue',
    lede: 'One of the largest car-free cities on Earth, a blue town, and goats that climb trees.',
    intro: '<p>Fes el Bali is one of the largest car-free urban areas anywhere, where goods still move by donkey through streets that were laid out before the printing press. Chefchaouen is painted in a dozen shades of blue that get refreshed by hand each spring. In the southwest, goats genuinely climb argan trees for the fruit.</p><p>The entries here also cover the three glasses of mint tea and what each one means, the solar complex at Ouarzazate that stores heat in molten salt to generate power after dark, and the medina navigation rule that works eight times out of nine: if the street narrows you are going the wrong way.</p>',
  },
  {
    slug: 'brazil', name: 'Brazil', title: 'Brazil', match: ['Brazil'],
    query: 'rio de janeiro brazil',
    lede: 'Nearly half a continent, a river with no bridges, and a capital built from nothing in four years.',
    intro: '<p>Brazil occupies about 47 percent of South America and borders every country on the continent except Chile and Ecuador. No bridge crosses the main stem of the Amazon: communities along thousands of kilometres rely on boats, which is a fact that reorganises how you plan a trip entirely.</p><p>Below: the two rivers at Manaus that run side by side for six kilometres without mixing, the beach that applauds the sunset every clear evening without anyone organising it, and the neighbourhood carnival block with a hundred drummers that nobody is filming. Brasilia, meanwhile, was planned and built in about four years and inaugurated in 1960.</p>',
  },
  {
    slug: 'spain', name: 'Spain', title: 'Spain', match: ['Spain'],
    query: 'seville spain plaza',
    lede: 'A cathedral still unfinished after 140 years, and a town that throws 150 tonnes of tomatoes.',
    intro: '<p>The Sagrada Familia has been under construction since 1882, funded almost entirely by donations and ticket sales rather than public money. Every August, Buñol throws roughly 150 tonnes of overripe tomatoes and then hoses down the main street. Madrid holds the oldest restaurant still trading, serving roast suckling pig since 1725.</p><p>The entries here also puncture the siesta myth, explain why an Asturian waiter pours cider from above his head without looking, and describe the moment on the Camino when two days of fog lift and the towers of Santiago are exactly where they should be.</p>',
  },
  {
    slug: 'turkiye', name: 'Türkiye', title: 'Türkiye', match: ['Turkey'],
    query: 'cappadocia turkey balloons',
    lede: 'The only major city on two continents, and an underground city that sheltered 20,000 people.',
    intro: '<p>Istanbul is the only large city built across two continents, and its commuters cross between Europe and Asia by ferry every morning for the price of a bus ticket. Under Cappadocia, Derinkuyu descends eighteen levels with ventilation shafts, wine presses and room for around 20,000 people and their livestock.</p><p>The volcanic tuff of Cappadocia is soft when freshly cut and hardens in air, which is why entire churches and hotels are carved into the cliffs. Elsewhere, calcium-rich springs at Pamukkale have built white terraces down a hillside over thousands of years. Order breakfast for two and expect eleven plates.</p>',
  },
  {
    slug: 'egypt', name: 'Egypt', title: 'Egypt', match: ['Egypt'],
    query: 'pyramids of giza egypt',
    lede: 'Cleopatra lived closer to the iPhone than to the building of the Great Pyramid.',
    intro: '<p>The chronology of Egypt breaks most people\'s intuition. The Great Pyramid was already ancient when the last woolly mammoths died out on Wrangel Island, and Cleopatra\'s lifetime sits nearer to the invention of the smartphone than to the pyramid\'s construction.</p><p>The entries here cover the temple at Abu Simbel that was cut into more than a thousand blocks and moved 65 metres uphill to escape a rising reservoir, the library at Alexandria that declined over centuries rather than burning in one dramatic night, the twenty balloons that rise together over the Valley of the Kings, and the felucca captain who sleeps until the wind decides to come back.</p>',
  },
  {
    slug: 'argentina', name: 'Argentina', title: 'Argentina', match: ['Argentina'],
    query: 'perito moreno glacier argentina',
    lede: 'The highest peak outside Asia, the widest avenue on Earth, and wind that never stops.',
    intro: '<p>Aconcagua rises to 6,961 metres, making it the tallest mountain in both the Southern and Western hemispheres. Avenida 9 de Julio in Buenos Aires spans about 110 metres, and crossing it can take more than one traffic light. Perito Moreno is one of the few glaciers on Earth that is broadly stable, periodically damming a lake until the ice arch collapses.</p><p>Below you will also find the Iguazú system of up to 275 separate falls, tango as it actually began in the port neighbourhoods, and the parrilla waiter who asks how you want your steak, disagrees, and turns out to be right.</p>',
  },
  {
    slug: 'greece', name: 'Greece', title: 'Greece', match: ['Greece'],
    query: 'santorini greece',
    lede: 'Six thousand islands, two hundred inhabited, and a marathon that started as a message.',
    intro: '<p>Greece has around 6,000 islands and islets and only about 200 of them are lived on. Santorini\'s red, black and white beaches all come from a single enormous eruption around 1600 BC that blew the middle of the island into the sea.</p><p>The entries here include the Samaria Gorge running sixteen kilometres to the Libyan Sea and narrowing to four metres at the Iron Gates, the shepherd whose shortcut takes two hours and involves no path at all, the olive harvest that pays in oil, and the ferry deck at four in the morning when the engines change pitch and an island appears one white line at a time.</p>',
  },
  {
    slug: 'england', name: 'England', title: 'England', match: ['England'],
    query: 'stonehenge england landscape',
    lede: 'The world\'s first underground railway, and stones dragged 250 kilometres before the wheel was common.',
    intro: '<p>The Metropolitan Railway opened in 1863, making the London Underground the first urban underground railway anywhere. Some of Stonehenge\'s bluestones were moved roughly 250 kilometres from the Preseli Hills in Wales more than 4,000 years ago, by means nobody has fully explained.</p><p>Below: the 1.1 million litres of 46-degree water that rise through the Roman baths at Bath every day, having fallen as rain thousands of years earlier; the Cornish language that died out and was brought back; the causeway at St Michael\'s Mount that the sea draws for you over twenty minutes; and the fact that Big Ben is the bell, not the tower.</p>',
  },
  {
    slug: 'vietnam', name: 'Vietnam', title: 'Vietnam', match: ['Vietnam'],
    query: 'ha long bay vietnam',
    lede: 'Sixteen hundred limestone islands, a railway that runs through people\'s front rooms, and coffee worth crossing a city for.',
    intro: '<p>Hạ Long Bay contains close to 1,600 limestone karsts, most of them uninhabited because the cliffs are simply too steep. In Hanoi\'s old quarter a working railway runs within arm\'s reach of house fronts, and residents pull in their chairs twice a day as a matter of routine.</p><p>The entries here also include the advice for crossing a road full of motorbikes — walk slowly and never stop, terrifying for two days and obvious on the third — the sleeper bus with three rows of reclining pods and a strict no-shoes rule, and the bún chả stall that opens at eleven and sells out by one.</p>',
  },
  {
    slug: 'indonesia', name: 'Indonesia', title: 'Indonesia', match: ['Indonesia'],
    query: 'borobudur indonesia',
    lede: 'Seventeen thousand islands, a day of national silence, and the loudest sound in recorded history.',
    intro: '<p>Indonesia is the largest archipelago on Earth with around 17,500 islands, roughly 6,000 of them inhabited. The 1883 eruption of Krakatoa produced what may be the loudest sound ever recorded, audible in Australia and on Rodrigues Island nearly 5,000 kilometres away.</p><p>On Nyepi, the whole of Bali stops: the airport closes, lights stay off, and nobody goes outside for 24 hours, which makes it the darkest night sky the island gets all year. Below you will also find the sulphur miners of Ijen carrying ninety kilos up the same path in flip-flops, and the Komodo dragon that is entirely uninterested in you.</p>',
  },
  {
    slug: 'colombia', name: 'Colombia', title: 'Colombia', match: ['Colombia'],
    query: 'cartagena colombia old town',
    lede: 'The only South American country with two oceans, and a river that turns red for a few months a year.',
    intro: '<p>Colombia is the only country in South America with coastline on both the Caribbean and the Pacific. Caño Cristales turns red for part of the year because of an aquatic plant, mixing with green moss and yellow sand to produce something that photographs badly and looks unreal in person.</p><p>Every Sunday, Bogotá closes more than 100 kilometres of road to cars and hundreds of thousands of people cycle and skate through the city. The entries here also include the coffee farmer who shows you what a hand-picked kilo earns him and then what a cup costs in London, and does not seem angry about it.</p>',
  },
  {
    slug: 'norway', name: 'Norway', title: 'Norway', match: ['Norway'],
    query: 'lofoten norway fjord',
    lede: 'A 24-kilometre road tunnel lit blue to keep drivers awake, and football matches at two in the morning.',
    intro: '<p>The Lærdal Tunnel runs 24.5 kilometres under the mountains and is lit with blue and yellow caverns every six kilometres, purely so that drivers stay alert. Above the Arctic Circle the sun does not set for weeks in summer, and locals genuinely play football at two in the morning because there is no reason not to.</p><p>Below: the Global Seed Vault inside a Svalbard mountain holding over a million samples as a backup for the planet\'s food crops, the fisherman who unties his boat when you miss the last ferry, and the cheese slicer invented in 1925 by a furniture maker who adapted a carpenter\'s plane.</p>',
  },
  {
    slug: 'france', name: 'France', title: 'France', match: ['France'],
    query: 'provence france village lavender',
    lede: 'Twelve time zones, 300 kilometres of tunnels under Paris, and a summit height that keeps changing.',
    intro: '<p>Thanks to overseas territories from Polynesia to the Caribbean, France spans twelve time zones, more than any other country. Beneath Paris run some 300 kilometres of quarry tunnels, part of which hold the bones of around six million people moved out of overflowing cemeteries.</p><p>Surveyors remeasure Mont Blanc every two years because its ice cap gains and loses metres, so the official height keeps moving. The entries here also include the Provençal market that is packing up by half past eleven, the busker on the last métro, and the lighthouse cat that still patrols as though it has responsibilities.</p>',
  },
  {
    slug: 'portugal', name: 'Portugal', title: 'Portugal', match: ['Portugal'],
    query: 'lisbon portugal tram',
    lede: 'The oldest bookshop still trading, and the world\'s oldest demarcated wine region.',
    intro: '<p>Bertrand in Lisbon\'s Chiado has been selling books since 1732 and holds the record as the oldest bookshop still in business. Port wine takes its name from Porto, although the grapes grow upriver in the terraced Douro Valley, which was the first wine region in the world to be formally demarcated.</p><p>At Quinta da Regaleira in Sintra, an initiation well spirals 27 metres <em>down</em> into the earth instead of rising. Elsewhere below: tram 28 at seven in the morning when it is simply a commuter service, and the night bus that smelled of oranges because the man behind me had a crate of them.</p>',
  },
  {
    slug: 'ethiopia', name: 'Ethiopia', title: 'Ethiopia', match: ['Ethiopia'],
    query: 'ethiopia landscape',
    lede: 'Thirteen months in the year, a day that starts at sunrise, and churches carved downwards into rock.',
    intro: '<p>Ethiopia runs a 13-month calendar about seven years behind the Gregorian one, and the day begins at sunrise rather than midnight, which makes appointment-setting an interesting exercise. The eleven churches of Lalibela were cut <em>down</em> into solid rock in the 12th century, their roofs level with the ground.</p><p>Wild <em>Coffea arabica</em> still grows in Ethiopian forests, and the coffee ceremony — beans roasted in the room, ground by hand, poured three times — takes well over an hour. Refusing the third round is a small insult. The Danakil Depression, meanwhile, averages above 34 degrees year-round.</p>',
  },
  {
    slug: 'namibia', name: 'Namibia', title: 'Namibia', match: ['Namibia'],
    query: 'sossusvlei namibia dunes',
    lede: 'Dunes over 300 metres tall, trees that died 900 years ago and never rotted, and a road with two corners.',
    intro: '<p>Namibia was the first African country to write environmental protection into its constitution, and its entire coastline is now protected. The dunes at Sossusvlei reach over 300 metres and are coloured deep red by iron oxide that has been oxidising for millions of years.</p><p>At Deadvlei the camelthorn trees died around 900 years ago, but the air is too dry for decomposition, so they still stand black against white clay. The Hoba meteorite, at roughly 60 tonnes, has never been moved from where it landed 80,000 years ago. Sociable weavers build communal nests weighing a tonne.</p>',
  },
  {
    slug: 'south-africa', name: 'South Africa', title: 'South Africa', match: ['South Africa'],
    query: 'cape town south africa',
    lede: 'Three capitals, a mountain with more plant species than the United Kingdom, and penguins with right of way.',
    intro: '<p>South Africa has three capitals: Pretoria administrative, Cape Town legislative and Bloemfontein judicial, a compromise dating from 1910. Table Mountain alone hosts more plant species than the whole of the United Kingdom, as part of the tiny Cape Floral Kingdom.</p><p>A flat cloud called the tablecloth pours over the mountain when a southeast wind pushes moist air up the slope, and it can close in and lift again within ninety seconds. Caves northwest of Johannesburg have produced some of the richest early hominin fossil finds anywhere. At Boulders Beach, penguins cross the boardwalk in their own order and everyone waits.</p>',
  },
  {
    slug: 'ecuador', name: 'Ecuador', title: 'Ecuador', match: ['Ecuador'],
    query: 'galapagos islands ecuador',
    lede: 'The only country named after a line of latitude, and the point on Earth furthest from its centre.',
    intro: '<p>Ecuador is the only country named for a line of latitude, and the true equator sits slightly off the famous monument. Because the planet bulges at the equator, the summit of Chimborazo is the furthest point on Earth from the centre of the planet, even though it is nowhere near the tallest mountain.</p><p>In the Galápagos nothing runs away: a sea lion sleeps on a bench, a bird walks over your boot, a marine iguana sneezes salt at you without moving. Darwin\'s finches, each with a beak suited to different food, helped shape the theory of natural selection.</p>',
  },
  {
    slug: 'bolivia', name: 'Bolivia', title: 'Bolivia', match: ['Bolivia'],
    query: 'salar de uyuni bolivia',
    lede: 'Two capitals, the highest seat of government on Earth, and a salt flat that becomes a mirror.',
    intro: '<p>Sucre is Bolivia\'s constitutional capital while La Paz holds the government, which makes La Paz the highest seat of government anywhere. When a thin film of water covers the Uyuni salt flat it reflects the sky so precisely that the horizon disappears entirely.</p><p>Beneath that same flat lies one of the largest lithium deposits on the planet. The entries here also cover La Paz\'s cable car network, which is public transport rather than a ride, and the sixty-four kilometres of the Yungas Road where the guide checks the brakes four times and you are glad he did.</p>',
  },
  {
    slug: 'nepal', name: 'Nepal', title: 'Nepal', match: ['Nepal'],
    query: 'annapurna nepal himalaya',
    lede: 'The only non-rectangular national flag, a time zone offset by 45 minutes, and a mountain that keeps growing.',
    intro: '<p>Nepal is the only country with a non-quadrilateral flag, made of two stacked pennants representing the Himalayas. It also runs on UTC+5:45, one of a handful of time zones offset by three quarters of an hour. Everest rises a few millimetres a year and drifts northeast as the Indian plate pushes under Asia; its official height was revised to 8,848.86 m in 2020.</p><p>Below: the teahouse ledgers where prices climb with altitude because everything was carried up on somebody\'s back, and the porter with thirty-two kilos on a headstrap who overtakes you on every climb and asks, politely, whether your bag is really that heavy.</p>',
  },
  {
    slug: 'thailand', name: 'Thailand', title: 'Thailand', match: ['Thailand'],
    query: 'wat arun bangkok',
    lede: 'Never colonised, holder of the longest place name on Earth, and a new year fought with water.',
    intro: '<p>Thailand is the only Southeast Asian nation never taken by a European power, largely through skilled nineteenth-century diplomacy. Bangkok\'s full ceremonial name runs to 168 letters and holds the record for the longest place name in the world; locals simply say Krung Thep.</p><p>Songkran began as a gentle blessing with water and has become a nationwide three-day soaking in April, the hottest month, conducted with buckets and no remorse whatsoever. The most useful phrase in the country is <em>mai pen rai</em> — never mind, it\'s fine — and the most useful rule is to pick the stall with the longest queue of people not holding cameras.</p>',
  },
  {
    slug: 'philippines', name: 'the Philippines', title: 'Philippines', match: ['Philippines'],
    query: 'palawan philippines islands',
    lede: 'More than 7,600 islands, an underground river, and rice terraces older than most cathedrals.',
    intro: '<p>The Philippine archipelago counts over 7,600 islands, and new surveys keep adding a few more. The Puerto Princesa Subterranean River flows more than eight kilometres through a limestone cave straight into the sea. The Ifugao rice terraces at Banaue were carved into the Cordillera by hand roughly 2,000 years ago and are still farmed by the descendants of the people who built them.</p><p>Below you will also find the jeepney where fares pass forward hand to hand from the back and nobody loses a coin, and the typhoon week that stranded us somewhere far better than our itinerary.</p>',
  },
  {
    slug: 'tanzania', name: 'Tanzania', title: 'Tanzania', match: ['Tanzania'],
    query: 'serengeti tanzania wildlife',
    lede: 'A collapsed volcano holding 25,000 animals, and the shortest war in history.',
    intro: '<p>The Ngorongoro Crater is a caldera twenty kilometres across, home to around 25,000 large animals that rarely need to leave it. Kilimanjaro, Africa\'s highest mountain, is built from three cones — Kibo, Mawenzi and Shira — and Kibo is dormant rather than extinct.</p><p>The Anglo-Zanzibar War of 1896 lasted under 45 minutes, the shortest recorded war anywhere. The entries here also include the guide who says <em>pole pole</em> about four hundred times in five days, and the moment on summit night when walking at half speed stops feeling absurd because you have just passed the fast group sitting down in the dark.</p>',
  },
  {
    slug: 'mali', name: 'Mali', title: 'Mali', match: ['Mali'],
    query: 'djenne mali mosque',
    lede: 'The largest mud-brick building on Earth, replastered every year by an entire town.',
    intro: '<p>The Great Mosque of Djenné is the largest mud-brick structure in the world, and once a year the whole town turns out to replaster it. There are teams, there is a race, there is a great deal of mud, and being clean that day marks you out as a visitor.</p><p>Timbuktu\'s private libraries preserved hundreds of thousands of manuscripts on astronomy, law and medicine, and Sankore was a centre of learning with thousands of students in residence in the fifteenth century. Salt slabs are still cut at Taoudenni and carried by camel, though trucks now do most of the work.</p>',
  },
  {
    slug: 'chile', name: 'Chile', title: 'Chile', match: ['Chile'],
    query: 'atacama desert chile',
    lede: 'Four thousand three hundred kilometres long, 180 wide, and home to the clearest skies on Earth.',
    intro: '<p>Chile stretches more than 4,300 kilometres from desert to glacier while averaging only about 180 kilometres wide. Some weather stations in the Atacama have never recorded rain, and NASA tests Mars equipment there. Dry air and altitude also make it the best place on the planet for optical astronomy, which is why the major observatories are clustered along its spine.</p><p>Excavations on Rapa Nui showed that the famous moai heads sit on full buried torsos covered in carvings. Further south, only Antarctica and Greenland hold more ice than the Southern Patagonian Ice Field.</p>',
  },
  {
    slug: 'antarctica', name: 'Antarctica', title: 'Antarctica', match: ['Antarctica'],
    query: 'antarctica iceberg landscape',
    lede: 'The largest desert on Earth, with no time zone and 70 percent of the world\'s fresh water.',
    intro: '<p>Antarctica receives so little precipitation that it qualifies as the largest desert on the planet, and around 70 percent of the world\'s fresh water is locked in an ice sheet up to four kilometres thick. It has no time zone of its own: research stations simply use the time of whichever country supplies them, so neighbours can be hours apart.</p><p>Blood Falls is stained by iron-rich brine sealed beneath the ice for over a million years. Emperor penguins incubate their eggs on their feet through the polar night at temperatures below minus forty. Parts of the McMurdo Dry Valleys have not seen rain for roughly two million years.</p>',
  },
];

export const COUNTRY_BY_MATCH = COUNTRIES.reduce(function (acc, c) {
  c.match.forEach(function (m) { acc[m] = c; });
  return acc;
}, {});
