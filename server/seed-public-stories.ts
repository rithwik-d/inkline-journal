export type SeedAuthor = {
  email: string;
  displayName: string;
  handle: string;
  bio: string;
};

export type SeedStory = {
  slug: string;
  title: string;
  dek: string;
  body: string;
  theme: string;
  authorEmail: string;
  contentWarning?: string;
  isFeatured?: boolean;
  publishedAt: string;
};

function body(...paragraphs: string[]) {
  return paragraphs.join("\n\n");
}

export const seedAuthors: SeedAuthor[] = [
  {
    email: "amara.okafor@seed.inklinejournal.local",
    displayName: "Amara Okafor",
    handle: "amaraokafor",
    bio: "Writes about migration, family, and the places that stay with us after we leave.",
  },
  {
    email: "theo.marchetti@seed.inklinejournal.local",
    displayName: "Theo Marchetti",
    handle: "theomarchetti",
    bio: "Often writing about grief, brothers, and the practical parts of carrying on.",
  },
  {
    email: "iris.lindqvist@seed.inklinejournal.local",
    displayName: "Iris Lindqvist",
    handle: "irislindqvist",
    bio: "Writes about first love, ordinary longing, and the parts of a life that almost happened.",
  },
  {
    email: "noor.halabi@seed.inklinejournal.local",
    displayName: "Noor Halabi",
    handle: "noorhalabi",
    bio: "Family stories, kitchen memories, and the quiet ways people teach each other how to live.",
  },
  {
    email: "daniel.park@seed.inklinejournal.local",
    displayName: "Daniel Park",
    handle: "danielpark",
    bio: "Writes about work, failure, and the slower definitions of success.",
  },
  {
    email: "maeve.donnelly@seed.inklinejournal.local",
    displayName: "Maeve Donnelly",
    handle: "maevedonnelly",
    bio: "Mostly writing about healing, memory, and the small routines that help a body feel safe again.",
  },
  {
    email: "sasha.reyes@seed.inklinejournal.local",
    displayName: "Sasha Reyes",
    handle: "sashareyes",
    bio: "Friendship, distance, and the long afterlife of people who once knew you well.",
  },
  {
    email: "folasade.adetola@seed.inklinejournal.local",
    displayName: "Folasade Adetola",
    handle: "folasadeadetola",
    bio: "Writes about return, language, and the feeling of being changed by your own leaving.",
  },
  {
    email: "jordan.lewis@seed.inklinejournal.local",
    displayName: "Jordan Lewis",
    handle: "jordanlewis",
    bio: "Identity stories about names, work, and becoming more honest in public.",
  },
  {
    email: "camila.sousa@seed.inklinejournal.local",
    displayName: "Camila Sousa",
    handle: "camilasousa",
    bio: "Motherhood, home, and the parts of love that look nothing like the brochure.",
  },
  {
    email: "elena.popa@seed.inklinejournal.local",
    displayName: "Elena Popa",
    handle: "elenapopa",
    bio: "Writing about faith, doubt, and the communities that remain even after certainty leaves.",
  },
];

export const seedStories: SeedStory[] = [
  {
    slug: "the-room-i-left-behind",
    title: "The Room I Left Behind",
    dek: "I still know where the floor creaks in my mother's house, even though I have not lived there in twelve years.",
    theme: "migration",
    authorEmail: "amara.okafor@seed.inklinejournal.local",
    isFeatured: true,
    publishedAt: "2026-06-30T09:00:00Z",
    body: body(
      "I was twenty-two when I left home with one suitcase, a backpack, and a plastic food container my mother pushed into my hands at the gate. It had jollof rice in it, packed so tightly the lid would barely close. She did not hug me. She was never very physical, especially when she was worried. She stood there in her house dress and told me to call when I reached the bus station, then she asked if I had packed enough socks. That was her way of saying she knew I was really going.",
      "The room I grew up in was small and hot most of the year. The ceiling fan worked only if you tapped the switch twice. One corner of the wall had a stain from a leak that my father kept promising to fix. I used to think I would forget that room the minute I moved into a place with better windows and a door that locked properly. Instead it followed me everywhere. I have lived in three cities since then, and every time I unpack, I put my shoes in the same corner and fold my jeans the same way I did in that first room.",
      "For a long time I told the leaving story like it was simple. I said I moved for school, then stayed for work. That part is true. What I did not say was that I also left because I wanted to find out who I was when nobody in the neighborhood had known me since I was six. At home, every version of me had already been decided. I was the serious daughter, the one who did well in class, the one relatives pointed to when they wanted to make a comparison. I needed one place where I could be ordinary and figure myself out in private.",
      "A few years ago I went back for a wedding and slept in that room again. The bed was smaller than I remembered. The curtain had been changed. My mother now used the old desk to stack folded laundry. At two in the morning I got up to use the bathroom and still stepped over the exact spot that used to squeak near the door. My body remembered before I did. That was the moment I understood that leaving a place does not mean it stops living in you.",
      "I do not miss home every day. Most days I am busy, and my life here is mine in a way I once wanted badly. But every now and then I cut an onion and the smell takes me back to that room, to the sound of my mother calling my name from the kitchen, to the fan making that tired clicking noise above me. When that happens, I stop pretending I have outgrown where I came from. I have only learned how to carry it better."
    ),
  },
  {
    slug: "coming-home-different",
    title: "Coming Home Different",
    dek: "Going back after eleven years was harder than leaving, because everyone expected me to fit into the old version of myself.",
    theme: "migration",
    authorEmail: "folasade.adetola@seed.inklinejournal.local",
    isFeatured: true,
    publishedAt: "2026-06-28T09:00:00Z",
    body: body(
      "I went back to Lagos after eleven years away, and for the first three days I smiled so much my face hurt. I ate suya from the roadside, sat in my auntie's kitchen until midnight, and let cousins I barely recognized make jokes about my accent. I had imagined the trip so many times that I thought it would feel like stepping into a room I had only just left. Instead it felt like meeting a place that still knew me while I was trying to reintroduce myself.",
      "The strangest part was language. I could understand everything, but my mouth hesitated. Words that once came quickly now arrived half a second late, like luggage making its way around the carousel. My uncle laughed and said, 'See our foreigner,' and everybody else laughed too. I laughed because it was easier than explaining how that joke landed. I had spent years feeling too Nigerian in one place and not Nigerian enough in another. Now I was back home and still somehow outside the circle.",
      "One afternoon I visited the street where we used to live. The mango tree outside the gate was still there, taller and untidier than before. A different family lived in the house, and their youngest son peered at me through the bars while his mother asked if she could help me. I said no, sorry, wrong address, even though it was not wrong. I just did not know what I was supposed to do with the fact that my childhood had become someone else's ordinary Tuesday.",
      "By the end of the trip I stopped trying so hard to prove I belonged. I stopped correcting how people read me. I let myself be the cousin who asked too many questions and got lost once on a road she used to know. I realized home was not asking me to be unchanged. That demand was coming from me.",
      "When I left again, my aunt packed me food for the flight the same way my mother used to. At the airport she held my face and said, 'Next time, come longer.' I told her I would. What I meant was this: next time I will come with less performance. I will come as I am now, not as a person trying to win her place back."
    ),
  },
  {
    slug: "what-grief-taught-me-about-time",
    title: "What Grief Taught Me About Time",
    dek: "The month my brother died, all the clocks in our house seemed wrong, and none of us had the energy to fix them.",
    theme: "grief",
    authorEmail: "theo.marchetti@seed.inklinejournal.local",
    contentWarning: "grief and loss",
    isFeatured: true,
    publishedAt: "2026-06-26T09:00:00Z",
    body: body(
      "My brother Luca died on a Thursday afternoon in March. By Saturday the microwave said 1:07, the oven said 12:00, and the cheap wall clock in the kitchen had stopped entirely. Nobody fixed any of them. Our house had always run on practical habits. My mother paid bills early. My father sharpened pencils with a knife. Luca set three alarms for everything. After he died, the smallest tasks suddenly looked impossible, like they belonged to people with a future they were planning to use.",
      "For the first few weeks, time felt rude. People would tell us it had only been ten days, or almost a month, and I wanted to argue with them. There was no 'only' about it. Every hour had become crowded. I would wake up already tired because the minute I opened my eyes, I remembered again. Then came the phone calls, the paperwork, the casseroles, the messages from people who loved him in different ways and needed something from us, even if that something was just confirmation that this had really happened.",
      "The worst part was how normal some moments were. I would be making coffee and suddenly think, I should tell Luca about this, before remembering that there was nowhere to send the thought. He and I used to text stupid things back and forth all day. A picture of a badly parked car. A screenshot of a headline. A complaint about our mother asking the same question twice. Grief was not dramatic most of the time. It was administrative and repetitive. It was remembering, every few hours, that the line had gone dead.",
      "About two months later, my father changed the batteries in the wall clock. He did it without ceremony. He just took a chair from the dining room, climbed up, and set the right time. I was standing at the sink when I heard the ticking start again. For some reason that sound undid me more than the funeral had. It was the first moment I understood that grief does not stop life from moving. It just makes you angry at movement for a while.",
      "I still think about those broken clocks. I used to see them as evidence that we had fallen apart. Now I think they were a form of honesty. We were living outside normal time. Our house knew it before we did. When people ask me whether grief gets easier, I do not know exactly what to say. I only know that time starts working again, slowly. Not because you want it to, but because one day you look up and realize the clock has been ticking for a while."
    ),
  },
  {
    slug: "the-suit-in-the-closet",
    title: "The Suit in the Closet",
    dek: "I kept my father's navy suit for three years after the funeral because I could not decide what counted as letting go.",
    theme: "grief",
    authorEmail: "theo.marchetti@seed.inklinejournal.local",
    contentWarning: "grief and loss",
    publishedAt: "2026-06-23T09:00:00Z",
    body: body(
      "After my father died, my mother wanted to clear his side of the closet within a week. She said she could not bear to see his shirts every morning. I said we should wait. Neither of us was wrong, which made every decision harder. We were grieving in opposite directions. She needed less evidence. I needed more.",
      "There was one navy suit he wore to weddings, funerals, and any event that required what he called 'serious shoes.' It still smelled faintly like his aftershave when I took it off the hanger. I brought it to my apartment because I told myself I would have it altered and wear it. That sounded practical, which meant nobody argued with me. In truth I just wanted one thing of his that still held the shape of his body.",
      "The suit hung in the back of my closet through two summers and one move across town. Every time I cleaned, I touched the sleeve and then moved on. I kept thinking the right moment would present itself. Maybe on his birthday. Maybe after the first anniversary. Maybe when the grief looked less raw and more respectable. But grief is rarely that organized. Mostly the suit became part of the room. I stopped seeing it until a friend came over and asked whose it was.",
      "Last winter I finally took it to a tailor. The woman behind the counter pinned the shoulders, looked at me in the mirror, and asked if it had belonged to my father. I nodded. She said, 'We'll keep what we can.' That sentence broke something open in me. Not because it was sad, but because it was true. That is all grief ever asks of us. Keep what you can.",
      "I wore the suit to my cousin's wedding in April. The sleeves are still a little long. The trousers fit better than I expected. My mother cried when she saw me, then laughed because she said I stood exactly like him. For the rest of the night, people told stories about my father while I carried plates back to the kitchen. It did not feel like replacing him. It felt like making room for him in the life that is still happening."
    ),
  },
  {
    slug: "almost",
    title: "Almost",
    dek: "My first love lives in the part of my memory reserved for things that were real even if they never became official.",
    theme: "first-love",
    authorEmail: "iris.lindqvist@seed.inklinejournal.local",
    isFeatured: true,
    publishedAt: "2026-06-21T09:00:00Z",
    body: body(
      "I was nineteen when I met Elias in the bookstore where I worked part-time. He came in every Thursday just before my break and always left with one paperback and one coffee from the cafe next door. At first I thought he was flirting because he asked too many questions about books he clearly did not intend to buy. Later I learned that was just how he talked when he was nervous. We spent a whole summer circling each other in very plain sight.",
      "Nothing dramatic happened. That is what makes it hard to explain. We walked home together after closing. We sat too close on a park bench one night and neither of us moved away. He fixed the chain on my bike while I held a flashlight on my phone and tried not to look at his hands for too long. We almost kissed in the rain outside the shop in August, but a bus pulled up and the moment folded in on itself. After a while, our connection became built out of almosts.",
      "When university started again, life sped up. He moved across town. I got into a course load I could barely manage. We still texted, but less. Then one day he told me he had started seeing someone. He sounded careful when he said it, like he was stepping around broken glass. I said I was happy for him, and I even meant it in part. I was also furious at both of us for letting something real stay so vague that it could disappear without technically ending.",
      "For a long time I was embarrassed by how much that almost-relationship shaped me. It felt childish to be heartbroken over a person I had never officially been with. But first love is not always the person who was yours. Sometimes it is the first person who showed you how quickly your inner life could rearrange itself around another human being.",
      "I am thirty now. I have loved people in fuller, healthier, more adult ways since then. Still, when I walk into a quiet bookstore on a weekday afternoon, I think of that summer and the girl I was when a boy buying cheap paperbacks could change the weather in a room. I do not wish for him back. I just respect what that almost taught me: feelings do not wait for paperwork."
    ),
  },
  {
    slug: "the-number-i-never-deleted",
    title: "The Number I Never Deleted",
    dek: "I changed phones twice and still kept her contact, even when there was no longer a reason to call.",
    theme: "first-love",
    authorEmail: "iris.lindqvist@seed.inklinejournal.local",
    publishedAt: "2026-06-18T09:00:00Z",
    body: body(
      "For years I kept Mara's number in my phone under her full name, even after we stopped speaking. It survived software updates, one broken screen, and two late-night cleaning sprees where I deleted old screenshots, expired coupons, and people I barely remembered. I never called. I never texted. I just could not bring myself to remove the proof that once, for a little while, she had been the first person I wanted to tell everything to.",
      "We dated for nine months when I was twenty-four. She was my first love in the adult sense of the word, the first person I built routines around. Sunday grocery shopping. Wednesday pasta. Her leaving a mug in my sink and me pretending to complain about it. We broke up for reasonable reasons, which turned out to be their own kind of pain. Nobody cheated. Nobody shouted. We were just trying to build a future from different blueprints.",
      "After the breakup, I kept expecting a moment of clean closure. Instead there were leftovers. The black sweater she said looked better on me than on her. A train ticket from a weekend trip to Marseille. Her number in my phone. It bothered me that such a small thing held so much charge. Deleting it felt bigger than ending the relationship, maybe because it admitted that I was no longer leaving the door cracked open for a version of events I knew was not coming.",
      "I finally erased it last autumn while waiting at the dentist. There was no ceremony. I was early, flipping through contacts because I needed to send someone an address, and there it was. I pressed delete before I could make it into a decision. The world did not shift. No music swelled. They called my name for the appointment, and I went in.",
      "What surprised me was not sadness but relief. Keeping that number had started as love and turned, over time, into a habit of not fully accepting change. I still remember it by heart, which is its own small problem. But now memory can do its quieter job. It can hold what mattered without asking my present life to keep storing it in the front pocket."
    ),
  },
  {
    slug: "my-grandmothers-hands",
    title: "My Grandmother's Hands",
    dek: "When I think of my grandmother, I do not see her face first. I see her hands rinsing rice under the tap.",
    theme: "family",
    authorEmail: "noor.halabi@seed.inklinejournal.local",
    isFeatured: true,
    publishedAt: "2026-06-16T09:00:00Z",
    body: body(
      "My grandmother's hands were broad and warm and never still. They chopped parsley, counted change, buttoned school uniforms, and pinched my cheek hard enough to be affectionate and annoying at the same time. When I was little, I assumed all grandmothers moved like that, with the quiet speed of women who had spent decades making food and solving problems at once.",
      "She lived downstairs from us in a narrow apartment that always smelled like soap and onions. After school I would drop my backpack by her kitchen door and sit at the table while she cooked. She did not ask many direct questions. Instead she slid cut fruit toward me and waited. Eventually I would start talking about who got in trouble at school or why I was angry at my mother or how unfair it was that my brother did not have to help set the table. She listened with her hands busy in the sink.",
      "The older I got, the more I noticed how much those hands had done. She had raised four children, buried one husband, worked in a sewing factory for twenty years, and somehow still found the patience to teach me how to roll grape leaves without making me feel stupid. When she showed me, she never took over. She let mine be clumsy. She just said, 'Again,' in the calmest voice you can imagine.",
      "After she died, I inherited her wooden rolling pin and the metal bowl she used for dough. They are ordinary objects, slightly dented, nothing special if you saw them in a shop. But every time I use them I understand something new about what gets passed down in a family. Not just recipes. Not just tools. Tempo. Steadiness. The belief that feeding people matters even on bad days.",
      "I still miss her most in the kitchen. Not in the grand, dramatic way I expected. I miss turning to ask a small question and realizing there is nobody there to answer it exactly the way she would. How much salt? Is this dough too dry? Should I call my mother first or wait until I am less angry? Her hands cannot show me anymore, so I pay attention to what mine do. More often than not, they already know."
    ),
  },
  {
    slug: "the-voice-note-from-my-father",
    title: "The Voice Note From My Father",
    dek: "My father never said much out loud, so the thirty-eight second message he sent me meant more than he probably realized.",
    theme: "family",
    authorEmail: "noor.halabi@seed.inklinejournal.local",
    publishedAt: "2026-06-14T09:00:00Z",
    body: body(
      "My father is not a phone person. He answers on the third ring, says hello as if you have interrupted a meeting, and gets to the point quickly. If you text him something emotional, he replies with a thumbs-up or calls six hours later to ask if the car insurance has been renewed. So when I saw a voice note from him sitting in our family chat, I assumed he had tapped the wrong button.",
      "I opened it while standing in the cereal aisle at the grocery store. His voice sounded uncertain, like he had started recording before he knew what he wanted to say. He cleared his throat, then said, 'I know yesterday was rough. I should have listened more. Call me when you can.' That was it. Thirty-eight seconds. No dramatic apology. No deep explanation. Just more tenderness than I was used to hearing from him in that format.",
      "We had argued the night before about my decision to leave a stable job. He asked practical questions that sounded, to me, like doubt. I answered with the sharpness of a daughter who was tired of being treated like a risk assessment instead of a person. By the end of the call we were both quiet in the angry way that means the conversation is technically over but emotionally still burning.",
      "That little message did not erase the argument. It did something better. It showed me the effort. My father did not suddenly become a different man. He is still more comfortable fixing a leaking sink than talking through hurt feelings. But he picked up his phone, pressed record, and crossed a bridge that does not come naturally to him.",
      "I have listened to that message more times than I would admit to him. Not because it is perfect, but because it is specific. Love in families is often specific like that. It is not always eloquent. Sometimes it arrives in a container that would look small to anybody else. A voice note. A bag of oranges left by your front door. A question about whether you reached home safe. If you know the person sending it, you know how much it cost."
    ),
  },
  {
    slug: "a-failure-i-am-grateful-for",
    title: "A Failure I Am Grateful For",
    dek: "Losing the job I thought would prove I was doing well ended up forcing me to build a life that actually fit.",
    theme: "failure",
    authorEmail: "daniel.park@seed.inklinejournal.local",
    isFeatured: true,
    publishedAt: "2026-06-12T09:00:00Z",
    body: body(
      "At twenty-nine I got fired from a job I had built my whole personality around. I had the title people understood at dinner parties and the salary that made my parents stop worrying out loud. I also had acid reflux, a permanent twitch in one eyelid, and a habit of waking up at 3:00 a.m. to check emails that could easily have waited until morning.",
      "The company called it restructuring. My manager cried while reading from a script. I carried a cardboard box to the elevator with a plant, a notebook, and a mug somebody had given me that said HUSTLE. I threw the mug away in the lobby trash before I even reached the street. Then I walked home along the canal because I was too embarrassed to get on the train in the middle of the day wearing my office clothes.",
      "For the first month, I treated unemployment like a secret illness. I told people I was 'in transition.' I opened my laptop every morning at eight just to prove to myself I was still serious. But as the weeks passed, a quieter truth surfaced. I had not only lost a job. I had been released from a life that looked impressive from the outside and felt like a bad shoe from the inside.",
      "What came after was not glamorous. I freelanced. I cut expenses. I moved into a smaller apartment with worse light and better sleep. I took on projects I actually cared about, which meant explaining my work to relatives who preferred simple answers. I also started cooking again, seeing friends on weeknights, and remembering that my worth did not rise or fall with quarterly targets.",
      "I am not grateful for the humiliation itself. That part was real and unpleasant. I am grateful that the failure happened before I got so used to being praised for the wrong life that I stopped noticing it was the wrong one. Some losses are not blessings in disguise. They are just losses. This one happened to be a door I would never have opened on purpose."
    ),
  },
  {
    slug: "the-year-i-stopped-calling-myself-talented",
    title: "The Year I Stopped Calling Myself Talented",
    dek: "I used to think being good at something should make it easy. Then I met the version of work that did not care how gifted I felt.",
    theme: "failure",
    authorEmail: "daniel.park@seed.inklinejournal.local",
    publishedAt: "2026-06-10T09:00:00Z",
    body: body(
      "In school I was the kid adults described as naturally good at things. I wrote fast, tested well, and picked up new tasks without much visible struggle. For a long time I mistook that early ease for a permanent identity. I did not say it out loud often, but I depended on the idea that I was talented. It made me feel safe.",
      "Then I got to a point in my career where effort started to matter more than quickness. The work became bigger, slower, and much less interested in rewarding me for being clever in the first ten minutes. I received notes I did not like. Projects stalled. Other people seemed more disciplined, more patient, and more willing to be bad at something for long enough to improve.",
      "That year was brutal for my ego. I wanted to quit every time I felt average. I blamed managers, timing, even the tools we were using. Underneath all of that was a simpler fear: if I was not effortlessly good, then who was I? It sounds childish now, but it did not feel childish while I was living it. It felt like a private collapse.",
      "What changed me was not a breakthrough. It was repetition. I kept showing up. I made drafts that embarrassed me. I asked basic questions. I watched people I respected redo the same paragraph or spreadsheet or presentation five times without treating it like a referendum on their intelligence. They were not less talented than me. They were just less attached to protecting that word.",
      "I still like being good at things. I am not pretending otherwise. But I trust effort now in a way I did not before. Talent can get you noticed. It cannot carry you through the long middle where most real work happens. The year I stopped calling myself talented was the year I finally got serious."
    ),
  },
  {
    slug: "the-body-remembers",
    title: "The Body Remembers",
    dek: "I spent years calling it back pain before I had the language to admit it was also fear.",
    theme: "healing",
    authorEmail: "maeve.donnelly@seed.inklinejournal.local",
    contentWarning: "mental health",
    isFeatured: true,
    publishedAt: "2026-06-08T09:00:00Z",
    body: body(
      "For almost fifteen years I carried tension between my shoulder blades that never fully went away. I blamed my desk, my mattress, my posture, the weather, the shoes I wore on long days. Different doctors gave me stretches, anti-inflammatories, and one expensive ergonomic chair that looked like it belonged in a spaceship. Some of it helped a little. None of it explained why the pain got worse every time I had to visit my hometown.",
      "The first time my therapist asked where in my body I felt fear, I laughed because it sounded vague and impossible. Then I went quiet. I knew exactly where it lived. High in my back. Along my jaw. In the way I held my breath without noticing. Once I had that thought, a lot of my neat explanations started to fall apart.",
      "Healing was less dramatic than I expected. There was no single session where I cried and walked out new. Mostly there were small embarrassments. Realizing I clenched my teeth while checking email. Noticing that I apologized automatically when someone brushed past me. Learning that I felt safest when I made myself as easy to manage as possible. My body had built habits around survival and then forgotten to put them down.",
      "These days the pain still visits, especially during stressful weeks. The difference is that I do not treat it like a mystery anymore. I ask better questions. Have I slept? Have I eaten? Did something happen that I am pretending did not bother me? Sometimes the answer is annoyingly simple. Sometimes it takes longer.",
      "I used to think healing meant getting back to the person I was before certain things happened. I do not believe that anymore. I am not going backward. I am learning how to live with more honesty inside my own skin. Some days that looks like a breakthrough. Some days it looks like unclenching my shoulders in the supermarket line. Both count."
    ),
  },
  {
    slug: "tuesday-after-therapy",
    title: "Tuesday After Therapy",
    dek: "For months, the hardest part of therapy was not the session itself. It was the drive home after.",
    theme: "healing",
    authorEmail: "maeve.donnelly@seed.inklinejournal.local",
    contentWarning: "mental health",
    publishedAt: "2026-06-06T09:00:00Z",
    body: body(
      "My therapy appointments were on Tuesdays at four, which meant I always hit the supermarket parking lot on the way home at the exact hour everybody else in my neighborhood decided to buy milk and bread. I got into the habit of sitting in my car for ten minutes before going inside. Sometimes I cried. Sometimes I stared at the steering wheel and tried to remember what normal people did after talking about the worst things that had ever happened to them.",
      "I had expected therapy to feel productive in a clean, motivating way. Some weeks it did. More often it felt like someone had opened a drawer I had spent years keeping shut and then sent me back out into traffic. I would walk through the grocery store holding a basket, suddenly furious at the display of avocados or close to tears because the cashier asked if I wanted a receipt. Nothing was wrong with the receipt. My nervous system was just full.",
      "What helped was building a small routine around the messy part. I stopped scheduling calls right after therapy. I kept crackers in the car because hard conversations made me forget I was hungry. I made a playlist with songs that did not ask too much of me. On the hardest days, I texted one friend a single sentence: rough session, home in twenty. She never pushed for details. She just sent back, proud of you for going.",
      "Somewhere along the way, those Tuesdays became less frightening. Not easy, exactly, but familiar. I started to recognize the feeling of being stirred up as evidence that something real had happened, not proof that I was getting worse. Healing often looks worse before it looks better because you are finally paying attention.",
      "I still sit in the car sometimes after difficult appointments, even now. The difference is that I no longer think I am failing because I need that pause. I think I am taking care of myself in a very unglamorous, adult way. There is a kind of dignity in learning what helps and doing it, even when it is just breathing in a parking lot before you buy eggs."
    ),
  },
  {
    slug: "the-friend-who-left",
    title: "The Friend Who Left",
    dek: "We did not have a fight. We just stopped being part of each other's regular life, which turned out to hurt in its own way.",
    theme: "friendship",
    authorEmail: "sasha.reyes@seed.inklinejournal.local",
    isFeatured: true,
    publishedAt: "2026-06-04T09:00:00Z",
    body: body(
      "People know how to talk about breakups. They send sympathy texts, split the furniture, pick a side if they have to. Friendship endings are murkier, especially the quiet ones. My friendship with Lena did not explode. It thinned. We missed a few calls, then a few birthdays, then whole seasons of each other's life.",
      "For most of our twenties we were inseparable. She was the first person I called when I got promoted, the one who knew what I looked like before I had coffee, the one who could tell from a single 'lol' that I was actually upset. Then she moved for work, I got married, and both of us kept assuming the friendship would take care of itself because it always had. It turns out even durable things need maintenance.",
      "The hardest part was that nothing happened that I could point to. There was no betrayal to help me organize the grief. Just a growing awareness that if I got big news now, I no longer knew whether she would be one of the first five people I told. That realization landed heavier than I expected. It felt like learning a room in my house had been empty for months and I had somehow not noticed.",
      "I still have the blue bowl she made for me in a pottery class. It sits on my entry table holding keys and spare change. Every now and then I think about sending a long message, something honest and slightly embarrassing about how much I miss what we had. Then I panic and do nothing. There is pride involved, but also tenderness. I do not want to reduce years of love to a badly worded text sent at 11:40 p.m.",
      "Maybe this is what adulthood does to some friendships. Not because we stop caring, but because we become too distributed. Too many calendars. Too much tiredness. Too many versions of ourselves in circulation at once. I am still learning that a friendship can matter deeply even if it does not survive every season in the same form."
    ),
  },
  {
    slug: "when-we-started-talking-again",
    title: "When We Started Talking Again",
    dek: "It took my mother's hospital stay for us to remember how to speak to each other without keeping score.",
    theme: "friendship",
    authorEmail: "sasha.reyes@seed.inklinejournal.local",
    publishedAt: "2026-06-02T09:00:00Z",
    body: body(
      "Mina and I did not speak for almost three years. If you had asked either of us why, we could have given you an answer, but I am not sure either version would have explained the whole thing. There was resentment, pride, and the kind of accumulated misunderstanding that builds when two stubborn people both think the other one should call first.",
      "Then my mother landed in the hospital with pneumonia last winter, and somehow Mina found out. She sent a message that just said, Heard about your mom. I am outside with soup if you want it. I stared at the screen for a full minute before replying. When I walked out, she was leaning against her car holding a paper bag and looking almost exactly the same as she had at twenty-three.",
      "We did not fix everything in one conversation. That would have been easier, honestly. Instead we started small. A check-in the next week. Coffee a month later. A careful exchange of facts before we risked feelings. What surprised me was how fast some of the old ease came back. The rhythm was still there under all that silence, like a song I had not heard in years but somehow still knew.",
      "Eventually we talked about the actual rupture. The missed wedding event. The passive-aggressive comments. The season when both of us were quietly drowning and neither had the humility to admit it. We apologized badly and then better. No single sentence solved it. Trust came back in installments.",
      "We are not the exact same friends we used to be, and I think that is a good thing. The younger version of our friendship depended on being available for everything. The older version has more limits and, oddly, more honesty. We do not talk every day. We do not have to. I know now that repair can be ordinary. Sometimes it looks like soup in a paper bag and a person willing to stand outside until you decide whether to let them in."
    ),
  },
  {
    slug: "the-name-on-my-badge",
    title: "The Name on My Badge",
    dek: "Changing my work badge to the name I actually use felt small until I realized how many times I had been bracing for it every day.",
    theme: "identity",
    authorEmail: "jordan.lewis@seed.inklinejournal.local",
    isFeatured: true,
    publishedAt: "2026-05-31T09:00:00Z",
    body: body(
      "For two years at work I wore a badge with a name I no longer introduced myself with. It was not legally wrong and it was not exactly a secret. It just was not me. Every morning I clipped it to my shirt and told myself it was temporary, that I would sort it out when I had more energy, more confidence, a better explanation prepared for people who liked to ask unnecessary questions.",
      "The thing about living with a small daily mismatch is that it trains you to underestimate its cost. I got used to the split second before meetings where somebody would glance at my badge and use the wrong name. I got used to correcting people lightly, so lightly that they often missed the correction entirely. I got used to feeling relieved on days when nobody noticed it at all.",
      "What finally changed was not a dramatic act of courage. It was paperwork. Our company switched HR systems, and everyone had to re-submit profile details. The form had a field for preferred name. My cursor hovered over it for a ridiculous amount of time. Then I typed Jordan and hit save. A week later a new badge arrived in internal mail. White plastic, black lettering, nothing special. I held it in my hand longer than necessary before clipping it on.",
      "I thought I would feel exposed. Instead I felt tired in a new way, the kind that comes after you set down something heavy. I had not realized how much background effort it took to manage the old version. To predict reactions. To soften my own reality for other people's comfort. The new badge did not solve every awkward conversation. It did remove one daily point of friction that had been quietly scraping at me.",
      "Identity shifts are often described as declarations, but many of them are administrative. A name in a system. A box checked differently. An email signature updated at 10:14 on a Wednesday. That does not make them less meaningful. Sometimes a life changes because a person gets tired of rehearsing their own absence."
    ),
  },
  {
    slug: "cutting-my-hair-on-a-thursday",
    title: "Cutting My Hair on a Thursday",
    dek: "I thought I was getting a haircut. What I was really doing was giving myself permission to be seen differently.",
    theme: "identity",
    authorEmail: "jordan.lewis@seed.inklinejournal.local",
    publishedAt: "2026-05-29T09:00:00Z",
    body: body(
      "I cut my hair on a Thursday after work because I was afraid if I made it a weekend event, I would talk myself out of it. The appointment was at six. I almost canceled at five-thirty. I sat in the salon chair with that tight, polite smile people wear when they are pretending not to be scared of their own choices.",
      "For most of my life my hair had been part of how other people recognized me. Long, dark, careful. Pretty in the approved way. Even when I complained about how much time it took to wash and style, I also depended on it. It bought me a certain kind of acceptance. It let people make quick assumptions I was not always interested in challenging out loud.",
      "When the first section hit the floor, I felt physically lighter and unexpectedly emotional. Not because I thought short hair would transform me overnight, but because I knew this was one of the first decisions I had made mostly for myself and not for how I would be read at family gatherings or in photographs. I kept touching the back of my neck on the walk home. I must have looked ridiculous.",
      "The reactions were mixed. My sister loved it immediately. My mother asked if something was wrong. A coworker said, 'Wow, that's brave,' in the tone people use when they mean unfamiliar. None of that turned out to matter as much as I had imagined. The bigger change was internal. I started feeling less like I was managing a costume.",
      "I do not think self-knowledge always arrives through huge revelations. Sometimes it arrives through a Thursday appointment you keep despite wanting to cancel, and then through the quiet surprise of liking your reflection for reasons you cannot fully explain yet. That haircut did not solve my life. It did give me a small, solid memory of choosing myself on purpose."
    ),
  },
  {
    slug: "the-night-i-learned-her-cry",
    title: "The Night I Learned Her Cry",
    dek: "Nobody tells you that part of becoming a mother is learning one small person's sounds the way you once learned your own name.",
    theme: "motherhood",
    authorEmail: "camila.sousa@seed.inklinejournal.local",
    isFeatured: true,
    publishedAt: "2026-05-27T09:00:00Z",
    body: body(
      "In the first weeks after my daughter was born, every cry sounded urgent. Hungry. Hurt. Lonely. Overtired. I could not tell the difference, which made me feel like a fraud in my own home. People said things like, 'You'll know what she needs,' and I wanted to ask when exactly that magical knowledge was supposed to arrive because mine appeared to be stuck in traffic.",
      "One night around three in the morning, she started crying in a way I had not heard before. It was sharper, shorter, almost offended. I had already fed her, changed her, burped her, and walked circles around the living room rug. My husband had gone back to work that week, so I was alone with the baby, the silence of the apartment building, and a body that still did not feel like mine again.",
      "Out of desperation I sat down instead of continuing to pace. I held her against my chest and listened carefully, really listened, instead of treating the sound like an alarm to shut off. She was not hungry. She was not in pain. She was tired and angry about being tired. The moment I understood that, something shifted. I changed how I rocked her. I lowered my voice. Within minutes she settled.",
      "I cried after she fell asleep, partly from relief and partly because I had needed that small win so badly. Early motherhood can make you feel as if every basic task is a test you forgot to study for. People admire the baby and ask how you are doing, but often what they mean is whether you are surviving without making anyone uncomfortable.",
      "That night did not turn me into a serene, all-knowing mother. I still guessed wrong plenty of times after that. But it was the first moment I trusted that we were learning each other. Not instinct in the movie sense. Practice. Attention. Love expressed as repetition. I think that is what parenting is made of much more often than people admit."
    ),
  },
  {
    slug: "fifteen-minutes-in-the-car",
    title: "Fifteen Minutes in the Car",
    dek: "Some days the most honest part of motherhood happened before I unlocked the front door.",
    theme: "motherhood",
    authorEmail: "camila.sousa@seed.inklinejournal.local",
    publishedAt: "2026-05-25T09:00:00Z",
    body: body(
      "For a while I used to sit in my car for fifteen minutes after daycare pickup and before driving home. My son would be in the backseat singing to himself or asking for crackers, and I would just breathe with both hands on the wheel. I was not escaping him. I was trying to become the version of myself that could walk into the evening without already feeling defeated by it.",
      "Nobody had prepared me for how compressed that time of day would feel. Finish work. Pick up child. Start dinner. Answer one more email. Remember the school form. Find the missing shoe. Be patient. Be warm. Be efficient. Somewhere in all that, I kept disappearing. Then I would feel guilty for wanting a pause because good mothers are not supposed to need a buffer between roles. At least that is what I had absorbed.",
      "One Tuesday my son fell asleep in the car on the drive back. I parked outside our building and watched him in the rearview mirror. His mouth was open. One sock was half off. There were cracker crumbs on his jacket. I should have gone straight upstairs, but I sat there in the quiet and felt the day catch up with me. I realized rest does not become less necessary just because someone smaller also needs you.",
      "After that I stopped shaming myself for those fifteen minutes. Sometimes we listened to nothing. Sometimes I gave him a snack and scrolled on my phone. Sometimes I cried for exactly three minutes and then wiped my face before unbuckling him. Was it glamorous? Not even slightly. Was it helpful? Completely.",
      "Motherhood has made me more patient in some ways and less interested in pretending in others. I love my child deeply. I also need moments that belong only to me, even if they happen in a parked car with a sippy cup rolling around under the passenger seat. I think that kind of honesty is part of good parenting too."
    ),
  },
  {
    slug: "after-the-amen",
    title: "After the Amen",
    dek: "I did not lose faith all at once. It happened in small questions I could no longer answer the old way.",
    theme: "faith",
    authorEmail: "elena.popa@seed.inklinejournal.local",
    isFeatured: true,
    publishedAt: "2026-05-23T09:00:00Z",
    body: body(
      "I grew up in a church where certainty was treated like a virtue and doubt like a personal hygiene problem. You were supposed to bring your questions to God, yes, but only if you were also prepared to accept the approved answers. For a long time that arrangement worked for me. The rhythms were familiar. The songs made sense. I liked belonging to something that had a calendar and casseroles and people who noticed if you were missing.",
      "The trouble started after my mother's second surgery. People meant well. They said God had a plan. They said suffering made us stronger. They said miracles happen. I nodded because grief and fear made me polite. But inside, I was angry at how quickly pain became material for somebody else's lesson. I did not need a silver lining. I needed my mother to wake up without tubes in her arms.",
      "What followed was not a dramatic break with religion. I still attended for a while. I still bowed my head at the right moments. But the words started landing differently. Some Sundays I felt comforted. Other Sundays I felt like a person mouthing lines from a play she no longer believed in. The gap between those two experiences wore me out.",
      "The surprising part is that faith did not disappear completely when certainty did. It changed shape. I trust less in neat explanations now and more in the people who showed up with soup, rides to the hospital, and the patience to sit quietly when there was nothing helpful to say. If I still believe in anything, it is in that kind of presence.",
      "I do not know whether I will ever return to the faith of my childhood in the same form. Maybe I am not supposed to. Maybe growing up means letting some beliefs get more complicated instead of pretending they stayed clean. I still whisper prayers sometimes, usually in kitchens and parking lots and waiting rooms. They are shorter now. More honest too."
    ),
  },
  {
    slug: "the-church-basement-coffee",
    title: "The Church Basement Coffee",
    dek: "Long after doctrine stopped making sense to me, I kept coming back for the people and the coffee in paper cups.",
    theme: "faith",
    authorEmail: "elena.popa@seed.inklinejournal.local",
    publishedAt: "2026-05-21T09:00:00Z",
    body: body(
      "When I was deciding whether to leave church for good, the part that hurt most was not Sunday service. It was the basement afterward. That is where the real life happened. People brought store-bought cookies arranged on nice plates. Teenagers stacked folding chairs while pretending not to be listening to adult gossip. Somebody's aunt always made coffee too weak, and everybody drank it anyway.",
      "I realized, embarrassingly late, that I had mistaken community for agreement. I thought if the sermons no longer fit me, then the whole thing had to go. But what I missed, once I stopped attending regularly, was not doctrine. It was the practical kindness of being known by people who remembered how I took my coffee and asked about my brother by name.",
      "A few months ago I went back for a memorial service and ended up downstairs afterward holding one of those paper cups. Mrs. Petrescu came over, touched my elbow, and said she had been thinking about me. No interrogation. No speech about returning. Just warmth. I nearly cried into the powdered creamer.",
      "I still do not have tidy answers about belief. Some days I miss the confidence I used to hear in my own voice when I prayed. Other days I feel relieved to live without forcing certainty. What I know is that humans are not built for isolation, especially in seasons of grief or change. We need rooms where somebody notices when we walk in.",
      "Maybe that is part of what faith is for me now: not a closed set of conclusions, but a commitment to keep showing up where care is practiced. Sometimes that place is a church basement with weak coffee. Sometimes it is a friend's kitchen table. I am less interested in proving what I believe than in becoming recognizable by the way I stay."
    ),
  },
  {
    slug: "the-year-we-stopped-speaking-english-at-home",
    title: "The Year We Stopped Speaking English at Home",
    dek: "My mother decided our kitchen would not become another place where our first language disappeared.",
    theme: "identity",
    authorEmail: "amara.okafor@seed.inklinejournal.local",
    publishedAt: "2026-05-19T09:00:00Z",
    body: body(
      "When I was fourteen, my mother announced over dinner that we would stop speaking English at home as much as possible. My brother groaned immediately. I rolled my eyes. We both understood her perfectly well, but English had become the language of school, homework, television, and the fast version of ourselves we used outside. Our first language was slower. It asked more of our mouths.",
      "At the time I thought she was being dramatic. We were already the immigrant family on the block. I wanted fewer things that marked us as different, not more. I was tired of translating for neighbors, tired of teachers praising my English as if it had not become the language I thought in. Speaking our first language at home felt, to teenage me, like volunteering for extra difficulty.",
      "What my mother understood before I did was that language is not only communication. It is memory. It is how jokes land. It is the version of your grandmother that survives in stories because certain phrases do not really move cleanly into English. Once we let the first language shrink, whole parts of family life started becoming harder to access. We had words in English for many things. We did not have the exact same home in them.",
      "We never fully kept my mother's rule. We slipped. We mixed languages in the same sentence. We argued in whichever words came fastest. But the effort mattered. Years later, when my grandmother was sick and less able to follow English, I was grateful for every stubborn dinner where my mother had insisted we try. It gave me a way to sit beside my grandmother's bed and belong without needing translation.",
      "I think about that now whenever people talk about assimilation as if it is a one-way upgrade. There are gains, yes. There are also losses so ordinary you miss them until someone older reaches for a word and you cannot give it back. My mother was not fighting English. She was trying to keep the doors from locking behind us."
    ),
  },
  {
    slug: "the-last-box-in-the-hallway",
    title: "The Last Box in the Hallway",
    dek: "I knew my marriage was over when one box of his books sat by the door for two weeks and neither of us moved it.",
    theme: "failure",
    authorEmail: "maeve.donnelly@seed.inklinejournal.local",
    publishedAt: "2026-05-17T09:00:00Z",
    body: body(
      "When my marriage ended, people were kind enough to avoid calling it a failure to my face. They said it was sad. They said it was brave. They said sometimes people grow in different directions. All of that was true. It still felt like failure some days, especially in the practical moments. Dividing furniture. Telling family. Updating emergency contacts. Explaining to the internet that no, I was not taking a break from posting because I was very busy and fulfilled.",
      "The clearest memory I have is a cardboard box of my ex-husband's books sitting in the hallway. He packed the rest of his things quickly, but that box stayed there for almost two weeks because there was no room in his car the first trip. We both stepped around it every day. Neither of us mentioned it. The silence around that box said more about the end than any of our long, civilized conversations had.",
      "I had built a whole identity around being a person who made relationships work. I listened. I remembered birthdays. I stayed late to talk things through. Admitting that effort was not enough felt humiliating. I kept combing through the marriage like there had to be one correctable error, one move that would explain everything. The truth was less satisfying. We had tried. We had also become lonely in ways we did not know how to fix together.",
      "The box finally left on a rainy Sunday. He came up, carried it down, and stood in the doorway longer than necessary. We hugged awkwardly. Then he said thank you for being kind about all this, which made me cry after he went because kindness was not the point. I had wanted a different ending. But sometimes kindness is what remains when the desired ending is gone.",
      "I do not think of my marriage the way I used to. It was not a wasted chapter. It was a real one. Failure is not always proof that something should never have happened. Sometimes it is just proof that something ended before you were ready for it to."
    ),
  },
  {
    slug: "the-day-my-son-saw-me-cry",
    title: "The Day My Son Saw Me Cry",
    dek: "I wanted to be the calm parent. Instead I became the honest one, and I think that may be better.",
    theme: "motherhood",
    authorEmail: "camila.sousa@seed.inklinejournal.local",
    publishedAt: "2026-05-15T09:00:00Z",
    body: body(
      "My son was six the first time he saw me cry hard enough that I could not hide it. It had been a bad week. Work was a mess, my mother was having tests done, and someone had called from school about behavior I was too tired to decode kindly. By the time we got home I was holding myself together with the kind of focus that never lasts.",
      "He spilled apple juice on the rug and I snapped. Not screamed, but sharp enough that his face changed immediately. He went quiet. I bent down to grab paper towels, and before I knew it I was crying into the kitchen counter. He stood there in socks, looking confused and worried, and asked, 'Did I make you sad?'",
      "That question gutted me because I knew the answer mattered. I sat on the floor with him and said, 'No, baby. The juice was an accident. I had a hard day and my feelings got too big all at once.' He looked at me for a second, then handed me one paper towel like that might solve the whole thing. In that moment I realized how badly I wanted to model perfection, and how impossible that was.",
      "We cleaned the spill together. Later that night, after he was asleep, I thought about the mothers I had seen growing up. So many of them looked invincible from the outside. I respected them, but I also wonder what it taught us to see women carry everything without visible strain. I do not want my child to think love means never breaking down.",
      "I want him to know that adults have feelings, that repair is possible, that apologizing is a strength, and that care can happen even after a rough moment. I still wish I had more patience. But I no longer believe the goal is to look unshakable. The goal is to show him what coming back looks like."
    ),
  },
  {
    slug: "the-girl-who-translated-for-everyone",
    title: "The Girl Who Translated for Everyone",
    dek: "By twelve I was filling out forms at the clinic and pretending I understood more than I did.",
    theme: "migration",
    authorEmail: "folasade.adetola@seed.inklinejournal.local",
    publishedAt: "2026-05-13T09:00:00Z",
    body: body(
      "By the time I was twelve, I had learned how to translate at the pharmacy, at parent-teacher meetings, and once, memorably, while my mother was arguing with the internet company on speakerphone. Adults praised me for being helpful. What they did not see was how often I was guessing. I knew enough to get us through and not enough to feel relaxed doing it.",
      "There is a strange power that comes from being the child who can speak for the family outside the house. Teachers smile at you differently. Receptionists look at you instead of your parents. You feel older than you are and younger at the same time because you are being trusted with things that should not really be yours yet. I got good at sounding confident, which is not the same as being confident.",
      "For years I thought of translation as proof that I was useful. It made me proud. It also made me tired in a way I did not name until adulthood. When you are the bridge, people mostly talk about how necessary you are. They talk less about what it costs to hold other people's fear, confusion, and dignity while still being a kid who needs help with math homework.",
      "I noticed the shift when my parents stopped asking me to come to every appointment. At first it felt like losing a role I had mastered. Then it felt like relief. I had not realized how tightly I was still gripping the responsibility long after it was needed. Even now, if I am in a waiting room and hear someone struggling with a form, my whole body leans forward.",
      "I do not resent that girl I was. She did the best she could with a hard and grown-up task. I just wish somebody had told her that being needed is not the same thing as being okay. Sometimes I write to thank her. Sometimes I write to let her rest."
    ),
  },
  {
    slug: "the-drawer-full-of-programs",
    title: "The Drawer Full of Programs",
    dek: "My mother kept every funeral program, and after she died I understood why she could never throw them out.",
    theme: "grief",
    authorEmail: "amara.okafor@seed.inklinejournal.local",
    contentWarning: "grief and loss",
    publishedAt: "2026-05-11T09:00:00Z",
    body: body(
      "After my mother died, I found a kitchen drawer full of funeral programs. Neighbors. Cousins. Church friends. People I barely remembered. She had folded some of them in half to make room and tucked others underneath takeout menus and warranty papers. It was the least glamorous archive imaginable, which felt exactly right for her.",
      "My first reaction was confusion. Why keep these? They were not photographs. Most of the people in them had already faded from the daily language of our family. But then I started reading the names and dates and realized the drawer was not about paper. It was about witness. My mother had been the kind of person who showed up, sat through the service, greeted the grieving relatives, and took the printed program home because the day mattered and she wanted some small proof that she had been there.",
      "In the months after her funeral, I became weirdly attached to that drawer. I opened it when I was missing her and could not explain why. I think part of me liked seeing evidence that she had practiced grief long before we had to practice it without her. She knew loss was ordinary in the most painful sense. She also knew ordinary people need rituals to help them carry it.",
      "I still have the drawer, though I moved the papers into a box and labeled it more carefully than she ever would have. Sometimes I pull one out at random and look up the person, if I can. Sometimes I just hold the paper and think about my mother standing in a church lobby, hugging somebody who had lost someone they loved, then coming home and sliding the program into the drawer before starting dinner.",
      "Grief has made me less dismissive of the little objects people keep. A receipt. A voicemail. A service sheet printed on cheap paper. Not because the objects are magical, but because they anchor a memory long enough for us to come back to it. My mother knew that instinctively. I am still learning it from her."
    ),
  },
  {
    slug: "the-first-time-i-said-my-name-correctly",
    title: "The First Time I Said My Name Correctly",
    dek: "For years I offered people the easy version of my name before they even had the chance to try.",
    theme: "identity",
    authorEmail: "jordan.lewis@seed.inklinejournal.local",
    publishedAt: "2026-05-09T09:00:00Z",
    body: body(
      "In college I started introducing myself with the shortened version of my name because it made rooms move faster. People remembered it more easily. They repeated it back without wincing. I told myself it was not a big deal. After all, I still knew who I was. I still signed the full name on forms. I was just being practical.",
      "Practicality can hide a lot. Over time I noticed that I began offering the easy version before anyone even asked. I was preempting the stumble. Preventing the correction. Protecting strangers from the mild inconvenience of trying. It worked well enough that I did not question it until a newer coworker heard my mother say my full name on the phone and asked why she was the only person using it.",
      "That question bothered me for weeks. Not because I did not have an answer, but because I had too many. I wanted to be liked. I wanted to be hired. I wanted fewer explanations in places where I was already working hard to fit. None of those reasons were shameful on their own. Together, they had still resulted in me disappearing a little every time I introduced myself.",
      "The first time I corrected someone and asked them to try again, my face went hot. The second time was easier. By the fifth time I realized most people were perfectly capable of learning if I stopped assuming they could not. The larger shift was in me. I had been treating my own name like a favor I was doing other people.",
      "I still shorten it sometimes with close friends, but now it is a choice and not a reflex. That distinction matters more than I used to understand. Identity is built in so many tiny moments of permission. Sometimes it starts with hearing your own name said the right way and noticing how much of you steps forward to meet it."
    ),
  },
  {
    slug: "the-wedding-we-could-not-afford",
    title: "The Wedding We Could Not Afford",
    dek: "Calling off the big wedding felt humiliating at the time. It ended up saving us from starting our marriage under a performance we did not believe in.",
    theme: "failure",
    authorEmail: "daniel.park@seed.inklinejournal.local",
    publishedAt: "2026-05-07T09:00:00Z",
    body: body(
      "Three months before our wedding, my partner and I sat at the kitchen table with a spreadsheet and finally admitted we were in over our heads. The guest list kept growing out of politeness. The venue deposit was nonrefundable. Family expectations had become a second event planner, one with very strong opinions and no sense of budget. Every conversation about flowers somehow ended with one of us close to tears.",
      "The decision to cancel the big wedding and do something smaller felt like public failure. I had already told coworkers. My mother had already bought her outfit. There is a specific embarrassment in changing course on something people assume is supposed to be the happiest season of your life. I worried everyone would think we were unstable or secretly in trouble.",
      "What was actually true was simpler. We wanted a marriage more than we wanted a production. Once we said that out loud, everything became both harder and easier. Harder because we still had to make the phone calls. Easier because, for the first time in months, we were telling the truth.",
      "Some people were disappointed. A few were rude. Most got over it quickly because it turned out they had their own lives to return to. We got married that autumn in a room above a neighborhood restaurant with twenty-two people present. My uncle took blurry pictures. My partner's niece fell asleep in two chairs pushed together. We laughed more that day than we had laughed in the six months before it.",
      "I still think about how close we came to starting our marriage exhausted and resentful just to avoid the appearance of failure. I am grateful we chose the smaller room. It taught me that sometimes the bravest financial decision is also the most personal one."
    ),
  },
];
