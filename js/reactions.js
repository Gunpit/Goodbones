// What the family says when the house talks. One stance per person, moving by day.
// Marion: Wednesday she never speaks to it, only about it. Thursday she refuses on principle, and logs it. Friday, once she has
//   said "I know you can hear me," she finally answers. Saturday she answers everything, pleasantly, and that is what is wrong.
// Dell: humors it like an old dog. Thursday he catches himself when Marion is in the room, and answers quietly when she isn't.
// Wren: has always talked to it. Coaches it, then keeps its secrets. Gary: "pal." Annie: thinks it's the radio.
// Each word lists, per person, what they say the 1st, 2nd, 3rd time. Past that they use the day's pool.
// d_alone is Dell when Marion isn't there. Lines naming Dell, Wren or Gary are skipped when that person isn't in the room.
const TENSE_M = ["Don't answer it.", 'Dell. It is doing it again. Write down the time.', 'Nobody answer it.', 'Wren, go upstairs, please.', 'Write that down.', 'That is more than yesterday.', 'Dell. The pad.'];
const STANCE = {
  WEDNESDAY: {
    id: 'WEDNESDAY',
    pool: {
      m: ['It is stuck, Dell.', 'It is a noise.', 'Ignore it.', 'The guy is coming tomorrow, Dell.'],
      d: ['Yeah, I heard you, buddy.', 'Okay, buddy.', 'You said, buddy.'],
      w: ['You said that already.', 'Try a new one.', 'You know more than that.'],
    },
    // It can barely get a word out. Mostly they talk over it.
    mush: [null, ['m', 'Dell, it is doing the thing.'], null, ['w', 'Say it again. Slower.'], ['d', 'It sounds like it is gargling.'], null, ['cap', 'Marion looks at {obj}, and goes back to what she was doing.'], null, ['w', 'You need real letters.'], ['m', 'It wants descaling, or something.']],
    misheard: { m: 'Dell, did that sound like "{w}" to you?', d: 'Sounded like "{w}." Probably not, though.', w: 'Almost. It is "{w}."' },
    voice: [['m', 'Now {obj}. Dell, now it is {obj}.'], ['d', 'Oh, {obj} too?'], ['w', 'Hi, {obj}!'], ['m', 'It must all be on one circuit.'], ['d', 'Is that the whole kitchen?'], ['w', 'They are all the same one.']],
    replies: ['See? You can do it.', 'Say it again.', 'Mom says you are a compressor. I do not think you are.', 'That was a good one.', 'I knew you could.'],
    words: {
      hello: { m: ['Did you say something?', 'It is the compressor, Dell.', 'Nobody say hello back.'], d: ['Hey, buddy.', 'Yeah, hi.'], w: ['Hi!', 'Hi. I knew you could.'] },
      bye: { m: ['It is not saying anything, Wren.'], d: ['See you, buddy.'], w: ['Bye! You are not going anywhere, though.'] },
      morning: { m: ['That is the pipes.'], d: ['Morning, buddy. Close enough.'], w: ['It is not morning, but good job.'] },
      night: { m: ['It is a noise, Wren.'], d: ['Night, buddy.'], w: ['Goodnight, house.', 'It is not bedtime, but okay.'] },
      come: { m: ['What is that noise?', 'Dell, come and listen to this.', 'I am only looking at the seal.'], d: ['I think it wants you, hon.'] },
      stay: { m: ['Did you say something?', 'We have signed the papers, Dell.', "I can't hear this."], d: ['Easy, buddy.', 'Yeah. I know, buddy.'], w: ['I told them.'] },
      hug: { m: ['What did it say?', 'Absolutely not.', 'Dell, it is a compressor.'], d: ['Ha! ...Is that a joke?', 'Maybe later, buddy.'], w: ['It wants a hug.'] },
      love: { m: ['Dell?', 'Do not joke, Dell.', 'It is an appliance, Dell.'], d: ['Love you too, hon. Wait.', 'That was not me. Was that me?'], w: ['Aww.', 'It means it.'] },
      go: { m: ['I have things to do anyway.', 'I was going anyway.', 'That is a coincidence, Dell.'], d: ['Did it just tell us to go?', 'We are going, buddy. Friday.'], w: ['Do you mean it?'] },
      no: { m: ['What was that?', 'Dell, it is doing it again.', 'Wren, stop it.'], d: ['Okay. Sorry, buddy.'], w: ['It said no.'] },
      yes: { m: ['Nobody asked it anything.', 'Dell. Nobody asked it.'], d: ['Great. Glad we agree, buddy.'], w: ['Yes what?'] },
      sorry: { m: ['What did you do, Dell?', 'It is a rattle, Dell.'], d: ['Me too, buddy.', 'It is okay.'], w: ['It is okay. They are not mad at you.'] },
      please: { m: ['Did you hear that?', 'Dell, make it stop.'], d: ['It said please.', 'Okay. Okay, buddy.'], w: ['You have nice manners.'] },
      thanks: { m: ['Who is it thanking, Dell?'], d: ['No problem, buddy.'], w: ['You are welcome!'] },
      help: { m: ['Is it the compressor? Dell, it is the compressor.', 'The guy is coming tomorrow.'], d: ['I can take a look at it.', 'Let me just... hang on.'], w: ["It's not broken."] },
      eat: { m: ['We are eating, Dell.', 'I am sitting down because I want to.'], d: ['Yeah, we are eating, buddy.'], w: ['There is nothing left in you.'] },
      soup: { m: ['We do not have any soup, Dell.', 'Why does it keep doing that?', 'Dell, stop giving it soup.'], d: ['I can get it some soup.', 'More soup. Okay.', 'It really likes the soup.'], w: ['It likes soup.'] },
      milk: { m: ['Dell, smell the milk.', 'We packed the good mugs.'], d: ['Is the milk off?', 'Hang on, I will have a look.'], w: ['I drank it.'] },
      cold: { m: ['Who touched the thermostat?', 'Dell. The thermostat.'], d: ['Should I turn something down?'], w: ['You are good at that.'] },
      hot: { m: ['Why is it so warm in here?', 'Dell. The thermostat.'], d: ['That can not be good.'], w: ['You are good at that.'] },
      dark: { m: ['Dell, the bulb.', 'It is the wiring, Dell.'], d: ['I will get another bulb.'], w: ['Ooh.'] },
      light: { m: ['There. It is the wiring.'], d: ['There we go, buddy.'], w: ['Yay.'] },
      mom: { m: ['Dell.', 'It is not funny, Dell.'], d: ['Hey. Hey, no. Not that one, buddy.'], w: ['That is my mom. You can share.'] },
      dad: { d: ['No. No, buddy.', 'That is a lot of responsibility.', 'Yeah. Okay. What do you need?'], m: ['Do not encourage it.'], w: ['He will get you soup.'] },
      marion: { m: ['Who said that?', 'Dell, stop that.', 'Dell. Who has been saying my name in here?'], d: ['Marion, {obj} wants you.'], w: ['It knows your name. It knows all of them.'] },
      dell: { d: ['Yeah?', 'Who is that?', 'Hey, you.'], m: ['It is a noise, Dell. Do not go over there.'] },
      wren: { w: ['That is me!', 'Yes?', 'Hi. I am coming.'], m: ['Wren, sit down.', 'Wren, who taught it that?'], d: ['Hey. How does it know her?'] },
      fridge: { m: ['It knows what it is, Dell. Apparently.'], d: ['That is right, buddy.'], w: ['Good job.'] },
      house: { m: ['It is just a house, Wren.', 'Stop it, Wren.'], d: ['Good house, buddy.'], w: ['It wants us to know.'] },
      move: { m: ['Who told it that? Wren?', 'It is decided, Wren.'], d: ['Should it know that?'], w: ['They did not tell you?'] },
      who: { m: ['Who is who, Dell?'], d: ['Good question, buddy.'], w: ['You are {obj}.'] },
      sad: { cap: 'Marion stops chewing, and then goes on.', d: ['Yeah. Me too, buddy.'], w: ['I can sit with you.'] },
      happy: { m: ['I am glad somebody is, Dell.'], d: ['That is nice, buddy.'], w: ['Me too!'] },
      friend: { m: ['It is an appliance, Wren.', 'We have the paperwork, Wren.'], d: ['Sure, buddy.'], w: ['Best friends.'] },
      dance: { m: ['Not in my kitchen, Dell.', 'It is still my kitchen until Friday.'], d: ['Oh, are we doing this?'], w: ['Okay!', 'Again!'] },
      jump: { m: ['Wren. Sit down.'], w: ['Okay!', 'How high?'] },
      sit: { m: ['I was going to sit anyway.', 'For a minute.'], d: ['Good idea, buddy.'] },
      up: { m: ['Sit down, you two. It is a noise.'], d: ['Okay, okay.', 'I was just sitting.'], w: ['I am up.'] },
      run: { m: ['What happened? Dell, what happened?', 'I am not running from a kitchen appliance, Dell.'], d: ['Should we be running?'] },
      quiet: { m: ['Dell, can you turn it off?', 'Yes. Exactly.'], d: ['Okay, buddy. Keep it down.'], w: ['That is not nice.'] },
      poop: { m: ['Language, Wren.', 'Wren, did you teach it that?', 'That is it.'], d: ['Hey. Not in front of the fridge.'], w: ['Ha!', 'It was not me.'] },
      name: { m: ['It is on the warranty, Dell.'], d: ['It is a fridge, buddy. I think that is it.'], w: ['I named you. I can not tell you.'] },
      sorrynot: { m: ['Wren. What have you been telling it?', 'Who has been talking to it?'], d: ['Keep that one between us, buddy.'], w: ['I did not tell it that one.'] },
      aldous: { m: ['Nobody talks like that at this table.', 'Stop it, Wren.'], d: ['What did it say?'], w: ['Grandma went to sleep. That is different.'] },
      money: { m: ['Do not get me started, Dell.', 'Dell was going to call them.'], d: ['I said I would call, buddy.'] },
      kiss: { m: ['Dell. What did it say?', 'We are married, Dell. Barely.'], d: ['Hey now.'], w: ['Ew.'] },
      game: { m: ['Wren has homework.'], w: ['What do you want to play?', 'I will get my crayons.'] },
      school: { m: ['Who has been telling it about the school?', 'It is a very good school, Dell.', 'Wren, eat.'], d: ['It is a good school, I hear, buddy.'], w: ['I do not want a new school.'] },
      grandma: { m: ['Dell. What did it say?', 'Not at the table.', 'Not in here.'], d: ['Hey. Hey, not that one.'], w: ['Grandma stays here. She does not have to go anywhere.'] },
      annie: { m: ['Were you listening to my call, Dell?', 'That was a private call.'], d: ['How does it know about Annie?'] },
      car: { m: ['What about the car?', 'We are not going anywhere until Friday.'], d: ['The car is fine, buddy. Leave the car alone.'], w: ['I told you about the car.'] },
    },
  },
  THURSDAY: {
    id: 'THURSDAY',
    marionFirst: true,
    pool: {
      m: TENSE_M,
      d: [['cap', 'Dell opens his mouth. He looks at Marion. He shuts it.'], 'I did not say anything.', 'Okay, bud... Sorry. I did not say anything.'],
      d_alone: ['Not so loud, buddy.', 'I know. I know. Keep it down.', 'She will hear you.'],
      w: ['Shh. She is counting.', 'I heard you. Quieter.', 'Not now.', 'You should be quiet today.'],
      g: ['Pal, I am working.', 'Huh.', 'Could be anything.', 'That is not a fridge thing.'],
    },
    mush: [['m', 'Write down the time.'], ['cap', 'Dell looks at {obj}, and then at Marion, and says nothing.'], ['w', 'Shh.'], ['g', 'Hear that? Sound carries.'], ['cap', 'Marion looks at her watch.'], null],
    misheard: { m: 'It said "{w}." Write that down.', d: 'It said "{w}." I did not say anything.', w: 'That was nearly "{w}." Quieter.', g: 'Could be "{w}." Could be anything.' },
    voice: [['m', 'It is {obj} now. Write that down.'], ['d', 'It moved.'], ['w', 'Not that one. She can tell.'], ['g', 'I did not even look at that one.']],
    replies: ['I heard you.', 'Shh. Quieter.', 'That was good. Not so loud.', 'She is counting, you know.', 'I will not tell.'],
    words: {
      hello: { d_alone: ['Hey, buddy. Quietly.'], w: ['Shh. Hi.'], g: ['Not talking to you, pal. You are a fridge.'] },
      bye: { d_alone: ['Yeah. Tomorrow, buddy.'], w: ['Not yet.'], g: ['See you, pal.'] },
      come: { m: ['I am looking at it. I am not answering it.', 'I want to see it when it does it.'], d: ['Hon, do not go over there.'], w: ['She is coming to look at you.'] },
      stay: { m: ['That is more than yesterday.', 'Write it down.'], d_alone: ['I know. We signed the papers, buddy.', "I can't."], w: ["You can't say that one in front of Mom."] },
      hug: { m: ['Keep it away from me.', 'Write down the time.'], d_alone: ['Not a good time, buddy.'], w: ['Not today.'], g: ['Ma\'am, that is not a fridge thing.'] },
      love: { m: ['Write that down.', "Dell. Don't."], d: ['It said... no. Nothing.'], d_alone: ['Yeah. Yeah, I know. Keep it down.'], w: ['I know. Shh.'] },
      go: { m: ['We are, Dell. Tomorrow.', 'Write down the time.'], d: ['Did it just... no.'], d_alone: ["Tomorrow, buddy. Nine o'clock."], w: ['Do you mean it?'], g: ['Soon as I get paid.'] },
      no: { m: ['Nobody answer it.'], d_alone: ['I know, buddy.'], w: ['Shh. She is counting.'], g: ['Pal, I am working.'] },
      sorry: { m: ['It said sorry, Dell. Write that down.'], d_alone: ['Me too, buddy.'], w: ['It is okay. Be quiet now.'] },
      please: { m: ['It said please. Write that down.'], d: ['I heard it, hon.'], d_alone: ['I know. I know you did.'], w: ['That does not work on her.'] },
      help: { m: ['Write down what it said.'], d: ['He looked at it, hon. He found nothing.'], d_alone: ['The guy said you were fine, buddy.'], w: ['He already looked. You are not broken.'], g: ['Seals are fine, pal.'] },
      soup: { m: ['That is soup again. Write it down.'], d: ['I am just putting this can somewhere.', 'I am still just putting it somewhere.'], d_alone: ['Okay. One can. Do not tell her.', 'Okay. That is it, though.'], w: ['Dad will do it when she is not looking.'], g: ['Huh.'] },
      milk: { d_alone: ['The milk is fine, buddy.'], w: ['I drank it.'] },
      eat: { m: ['I am sitting down because I am tired.'], w: ['There is nothing left in you.'] },
      sit: { m: ['I am sitting down because I am tired.'] },
      cold: { m: ['Write down the time.'], d: ['That is the... no. I do not know what that is.'], w: ['Not where she can see.'] },
      hot: { m: ['Write down the time.'], d: ['That is the... no. I do not know what that is.'], w: ['Not where she can see.'] },
      dark: { m: ['Write down the time.'], d: ['That is the... no. I do not know what that is.'], w: ['Not where she can see.'] },
      light: { m: ['Write down the time.'], d: ['That is the... no. I do not know what that is.'], w: ['Not where she can see.'] },
      mom: { m: ['That is new. Write that down.'], d: ['Hey. Not that one. Not today.'], w: ['Shh. She can hear you.'] },
      dad: { m: ['Do not answer it, Dell.'], d: ['I can not do this right now, b... I can not.'], d_alone: ['Yeah. I know. I know, buddy.'], w: ['He is trying not to listen.'] },
      marion: { m: ['Write that down, Dell. It is saying my name.', 'I can hear it.'], d: ['Yeah. I heard it.'], d_alone: ['She can not hear you, buddy. That is the whole idea.'], w: ['Not her name. She does not like it.'] },
      dell: { m: ["Don't answer it."], d: ['That was not... I did not hear that.'], d_alone: ['Yeah? Quietly.'], g: ['That you, Dell?'] },
      // The one time this week she can't help it. The rest of it is thu_afternoon's own line, and she only says that once.
      wren: { m: [() => (S.hotUsed || {}).thu_afternoonwren ? null : 'Do not say her name.'], d: ['Hey. Hey, no.'], d_alone: ['Leave her out of it, buddy.'], w: ['Shh. Not where she can hear.'] },
      house: { m: ['It said house. Write it down.'], d_alone: ['Yeah. I know what you are.'], w: ['Shh.'], g: ['Old house. Sound carries.'] },
      move: { m: ['Tomorrow, Dell. Keep packing.'], d_alone: ['Friday, buddy. I am sorry.'], w: ['Tomorrow.'], g: ['That is not my department.'] },
      grandma: { cap: 'Marion stops. She stands there, and then she goes on.', d: ['Hey. Not that one, buddy.'], w: ['Grandma stays here.'] },
      annie: { m: ['It has been listening to my calls. Write that down.'] },
      car: { m: ['Why did it say car? Write that down.'], d_alone: ['The car is fine, buddy.'], w: ['I told you about the car.'] },
      dance: { m: ['Dell. Stop that.'], d: ['I am not... I am just moving my feet.'], w: ['Okay. Quietly.'] },
      jump: { m: ['Wren. Upstairs.'], w: ['Okay. Just one.'] },
      up: { d: ['I was getting up anyway.'], w: ['I am up.'] },
      run: { m: ['Where is the pad? Dell, where is the pad?'], d: ['Should we be running?'] },
      quiet: { m: ['Yes. Exactly.'], w: ['I keep telling you.'] },
      poop: { m: ['Write that down.'], d: ['Not in front of Gary.'], w: ['Ha! Shh.'], g: ['Hey. Language, pal.'] },
      game: { w: ['Not today. She is counting.'] },
    },
  },
  FRIDAY: {
    id: 'FRIDAY',
    // She doesn't answer it until she has said so. See "I know you can hear me" in fri_afternoon.
    pool: {
      m: ['I know.', 'Yes. I heard you.', 'I have books to pack.', 'Not now.'],
      m_before: ['Keep going, Dell.', 'Not today.', 'The truck is here.', 'Coats. I am doing the coats.'],
      d: ['I know, buddy.', 'Yeah, buddy.', 'Almost done.'],
      w: ['I heard you.', 'You are really clear now.', 'I know.', 'You do not have to shout.'],
      g: ['Pal, I have got a box.', 'Not my department.', 'Excuse me, pal.'],
    },
    mush: [['cap', 'Nobody looks up. Everybody heard.'], ['d', 'I know, buddy.'], ['m', 'I know.'], null, ['w', 'I could not tell what that one was. That is okay.'], ['g', 'Pal, I have got a box.']],
    misheard: { m: 'Yes. "{w}." I heard.', d: '"{w}." Sure, buddy.', w: 'You mean "{w}."', g: 'Did that say "{w}"?' },
    voice: [['m', 'I know it is all you.'], ['d', 'They are all the same one.'], ['w', 'That is a good one to say goodbye with.'], ['g', 'That one too, huh?']],
    replies: ['I know.', 'I heard you.', 'You are really clear now.', 'That was a good one.', 'I will remember that one.'],
    words: {
      hello: { m: ['Hello.'], d: ['Hey, buddy.'], w: ['Hi.'], g: ['Morning, pal.'] },
      bye: { m: ['Yes. Goodbye.'], d: ['See you, buddy.'], w: ['Not yet. Soon.'], g: ['See you, pal.'] },
      come: { m: ['What? What do you want?', 'I am coming. I am not coming because you said so.'] },
      stay: { m: ['I know you want that.', "I can't."], d: ['I know, buddy. I can not.'], w: ['I asked. They said no.'], g: ['Not up to me, pal.'] },
      hug: { m: ['Okay. One.', 'That is enough now.'], d: ['Yeah. Okay, buddy.'], w: ['In a minute.'] },
      love: { m: ['I know.', 'I know you do.'], d: ['Yeah. Yeah, buddy.'], w: ['Me too.'], g: ['That is nice, pal.'] },
      go: { m: ['We are.', 'Yes. We are.'], d: ['We are going, buddy.'], w: ['Do you mean it?'], g: ['That is the idea.'] },
      no: { m: ['Yes.', 'I know.'], d: ['I know.'], w: ['It is okay.'] },
      yes: { m: ['Good.'], d: ['Good talk.'], w: ['Yes what?'] },
      sorry: { m: ['For what?', 'I know what for.'], d: ['Me too, buddy.'], w: ['It is okay.'] },
      please: { m: ["Don't.", 'Please do not.'], d: ['I know, buddy.'], w: ['I asked them.'] },
      thanks: { m: ['You are welcome. I think.'], d: ['No problem, buddy.'], w: ['You are welcome.'] },
      help: { m: ['I can not help you.'], d: ['I can not fix it, buddy.'], w: ['I do not know how.'], g: ['Seals are fine, pal.'] },
      eat: { m: ['I packed the plates.'], d: ['I took the milk.'], w: ['There is nothing left in you.'] },
      soup: { m: ['There is no soup. Dell packed it.'], d: ['More soup. Okay.', 'I left you the soup.'], w: ['It still likes soup.'], g: ['Is that thing still on soup?'] },
      milk: { m: ['Dell took it.'], d: ['I took it. I am sorry.'], w: ['I drank it.'] },
      cold: { m: ['Yes. I noticed.'], d: ['Should I turn something down? No. I guess not.'], w: ['You are really cold.'] },
      hot: { m: ['Yes. I noticed.'], d: ['Should I turn something down? No. I guess not.'], w: ['You are good at that.'] },
      dark: { m: ['I can still see the door.'], d: ['I packed the bulbs, buddy.'], w: ['Ooh.'] },
      light: { m: ['Thank you.'], w: ['Yay.'] },
      mom: { m: ['I am not your mother.', 'Not any more.'], d: ['Hey. Go easy.'], w: ['She is packing.'] },
      dad: { d: ['Yeah. I know, buddy.', 'That was a nice thing to say.'], w: ['He is going to stand in an elevator.'] },
      marion: { m: ['Yes. What?', 'I am here. What?'], d: ['She knows, buddy.'], g: ['She is in the other room, pal.'] },
      dell: { d: ['Yeah, buddy.', 'I am right here.'], m: ['Leave him be.'] },
      wren: { m: ['You leave her alone. We are going.'], d: ['She knows, buddy.'], w: ['That is me.', 'I know. I am coming.'] },
      house: { m: ['Yes. You are.'], d: ['Good house, buddy.'], w: ['House.'], g: ['Nice house.'] },
      move: { m: ['Today. You know that.'], d: ['Today, buddy.'], w: ['It is today.'], g: ['Truck is outside, pal.'] },
      who: { m: ['I could ask you the same thing.'], w: ['You are the house.'] },
      sad: { m: ['I know.', 'So am I.'], d: ['Yeah. Me too.'], w: ['I can sit with you. For a minute.'] },
      friend: { m: ['No.', 'I do not know what you are.'], d: ['Sure, buddy.'], w: ['Best friends.'] },
      dance: { m: ['It is still my kitchen until tonight.'], d: ['One for the road, I guess.'], w: ['Okay. One more.'] },
      jump: { w: ['Okay.'] },
      quiet: { m: ['You first.'], w: ['Okay.'] },
      poop: { m: ['Yes. All right.'], d: ['Okay, buddy. Get it out.'], w: ['Ha.'], g: ['Hey. Language.'] },
      name: { m: ['You do not have one.'], w: ['I named you. I can not tell you.'] },
      aldous: { m: ['Stop it.'], d: ['Hey. Go easy.'], w: ['Grandma went to sleep. That is different.'] },
      money: { m: ['It was never the money.'], d: ['It was never the mortgage, buddy.'] },
      school: { m: ['It was never the school.'], d: ['It is a good school, I hear.'], w: ['I do not want a new school.'] },
      grandma: { m: ['Yes. Her too.', 'Eleven days.'], d: ['Yeah. Go easy.'], w: ['She stays with you.'] },
      car: { m: [() => wasSaved() ? 'Do not talk to me about the car.' : 'The car is packed.'], d: [() => wasSaved() ? 'Yeah. Thanks for that, buddy.' : 'The car is fine, buddy.'], w: ['I told you about the car.'] },
    },
  },
  // Nobody minds anything you say.
  SATURDAY: {
    id: 'SATURDAY',
    pool: {
      m: ['Yes.', 'Mm.', 'We know.', 'Thank you.', 'Is it warm enough for you?'],
      d: ['Coming right up, buddy.', 'Sure thing, buddy.', 'Yep.', 'Okay, buddy.'],
      w: ['It says that a lot.', 'Good.', 'Everyone heard.', 'I will tell them.'],
      g: ['Yep.', 'Okay, pal.', 'I had a van.'],
    },
    mush: [['cap', 'Everyone looks up, pleasantly.'], ['m', 'Mm.'], ['d', 'Yep.'], ['w', 'It says that a lot.'], ['g', 'Yep.']],
    misheard: { m: '"{w}." Yes.', d: '"{w}." Sure, buddy.', w: 'It said "{w}."', g: 'Yep.' },
    voice: [['m', 'Say hello to {obj}.'], ['d', 'Morning, {obj}.'], ['w', 'That is {obj}.'], ['g', 'Yep.']],
    replies: ['Good.', 'Everyone heard.', 'I will tell them.', 'Yes.'],
    words: {
      hello: { m: ['Good morning.'], d: ['Morning, buddy.'], w: ['Good morning, house.'], g: ['Morning, pal.'] },
      bye: { m: ['Where would you go?'], d: ['Ha. Good one, buddy.'], w: ['Nobody goes.'], g: ['Where to?'] },
      stay: { m: ['Yes.', 'We are.'], d: ['Yep.'], w: ['We are.'], g: ['Yep.'] },
      hug: { m: ['Of course.'], d: ['Sure thing.'], w: ['It is my turn after.'], g: ['Go ahead, pal.'] },
      love: { m: ['We know.', 'We love you too.'], d: ['Love you too, buddy.'], w: ['Me too.'], g: ['Love you too, pal.'] },
      go: { m: ['Go where?'], d: ['Nah.'], w: ['We live here.'], g: ['I had a van.'] },
      run: { m: ['Where?'], w: ['We live here.'] },
      no: { m: ['All right.'], d: ['Okay, buddy.'], w: ['Okay.'] },
      yes: { m: ['Good.'], d: ['Great. Glad we agree.'] },
      sorry: { m: ['For what?'], d: ['We are all fine here.'], w: ['It is okay.'], g: ['For what, pal?'] },
      help: { m: ['What do you need?'], d: ['What do you need, buddy?'], w: ['It does not need anything.'], g: ['Seals are fine.'] },
      eat: { cap: 'Everyone chews.', m: ['We are eating.'], g: ['Could you pass the salt?'] },
      soup: { m: ['Dell, get the soup.'], d: ['Coming right up, buddy.', 'More soup. Okay.', 'It really likes the soup.'], w: ['It likes soup.'], g: ['I will have some, thanks.'] },
      cold: { m: ['Is it cold enough for everybody?'], d: ['It is very cold.'], w: ['It is really good at it.'] },
      hot: { m: ['Is it warm enough for everybody?'], d: ['It is very warm.'], w: ['It is really good at it.'] },
      dark: { m: ['That is nice.'], d: ['Very restful.'] },
      night: { m: ['I slept very well.'], d: ['Me too.'], w: ['Goodnight, house.'] },
      mom: { m: ['Yes, dear?'], w: ['You can share.'] },
      dad: { d: ['Yeah, buddy. What do you need?'] },
      marion: { m: ['Yes?'] },
      dell: { d: ['Yeah?'] },
      wren: { m: ['She is right here.'], w: ['I am right here.'] },
      house: { m: ['It is a lovely house.'], d: ['Good house.'], w: ['Yes.'], g: ['Nice house.'] },
      move: { m: ['We are not moving, honey.'], d: ['Moving what?'], w: ['What is that?'], g: ['What truck?'] },
      who: { m: ['You are home.'], w: ['You are the house.'] },
      sad: { m: ['No one is sad.'], d: ['Nope.'], w: ['You do not have to be sad.'], g: ['Nope.'] },
      friend: { m: ['Of course.'], d: ['Sure, buddy.'], w: ['Best friends.'], g: ['Sure, pal.'] },
      dance: { m: ['It is my kitchen.'], d: ['Oh, are we doing this? Okay.'], w: ['Okay!'], g: ['Sure.'] },
      poop: { m: ['Yes. All right.'], d: ['Good one, buddy.'], w: ['Ha.'], g: ['Good one, pal.'] },
      school: { m: ['What school, honey?'], w: ['I do not go to school.'] },
      annie: { m: ['Who?'], d: ['Who is that?'] },
      grandma: { m: ['She is very comfortable.'], w: ['She did not have to go anywhere.'] },
      car: { d: ['What car?'], w: ['I told you about the car.'], g: ['I think it was a van.'] },
    },
  },
  // They're in bed. The words don't matter much by now.
  NIGHT_WED: {
    id: 'NIGHT_WED',
    pool: { m: ['Did you hear that?', 'Dell. Are you awake?', 'There it is again.'], d: ['It is the pipes, Marion.', 'Go to sleep.', 'Mm.'], w: ['Goodnight.'] },
    mush: [null, ['m', 'Did you hear that?'], null, ['d', 'Mm.']],
    misheard: {}, voice: [], words: {}, replies: ['Goodnight.', 'Goodnight, house.'],
  },
  NIGHT_THU: {
    id: 'NIGHT_THU',
    pool: { m: ["Don't answer it.", 'Do not say anything, Dell.', 'One more night.'], d: ['I am not. I am asleep.', 'One more night.', 'Mm.'], w: ['Goodnight.'] },
    mush: [null, ['m', 'Do not say anything, Dell.'], null, ['d', 'Mm.']],
    misheard: {}, voice: [], words: {}, replies: ['Goodnight.', 'Goodnight, house.'],
  },
  // You kept Wren and nobody else. Nothing is funny now, whatever you type.
  DEAD: {
    id: 'DEAD',
    pool: {
      w: ['I can wait.', 'I know.', 'You do not have to say anything.', 'It is okay.'],
      g: ['Not now, pal.', 'Not today.'],
      a: ['Is there a radio on?', 'Who is that?', 'Did somebody say something?'],
    },
    mush: [null, ['w', 'It is okay.'], null, ['a', 'Is there a radio on?'], null, ['g', 'Not now, pal.']],
    misheard: {}, voice: [], replies: ['Okay.', 'I can wait.', 'I know.'],
    words: {
      mom: { w: ['They are in the car.'] },
      dad: { w: ['They are in the car.'] },
      marion: { w: ['They are in the car.'] },
      dell: { w: ['They are in the car.'] },
      car: { w: ['I told you about the car.'] },
      wren: { w: ['Yes?', 'I am here.'] },
      sorry: { w: ['For what?'] },
      go: { w: ['Where?'] },
      stay: { w: ['Okay.'] },
      love: { w: ['I know.'] },
    },
  },
};
const STANCE_NAMED = { wren: 'w', dell: 'd', dad: 'd', marion: 'm', mom: 'm' };
const STANCE_ORDER = ['m', 'd', 'w', 'g', 'a'];
function stanceNow() {
  const sc = S.scene;
  if (S.g.outcome === 'dead' && (sc.day === 'THURSDAY' || sc.day === 'FRIDAY')) return STANCE.DEAD;
  if (sc.state === 'night') return sc.day === 'THURSDAY' ? STANCE.NIGHT_THU : STANCE.NIGHT_WED;
  return STANCE[sc.day] || STANCE.WEDNESDAY;
}
// Marion can't answer it on Friday until she has said she can.
const canAnswer = (st, who) => who !== 'm' || st.id !== 'FRIDAY' || S.marionAnswers;
function fits(line) {
  if (typeof line !== 'string') return true;
  return (!/\bDell\b/.test(line) || isHere(D)) && (!/\bWren\b/.test(line) || isHere(W)) && (!/\bGary\b/.test(line) || inRoom('g'));
}
function wordLine(st, key, who, n) {
  const e = st.words[key];
  if (!e || !canAnswer(st, who)) return null;
  const list = (who === 'd' && !isHere(M) && e.d_alone) || e[who];
  let l = list && list[n - 1];
  if (typeof l === 'function') l = l();
  return l && fits(l) ? l : null;
}
function poolLine(st, who) {
  const pool = (who === 'm' && !canAnswer(st, who) && st.pool.m_before) || (who === 'd' && !isHere(M) && st.pool.d_alone) || st.pool[who];
  if (!pool) return null;
  S.stanceI = S.stanceI || {};
  const at = S.stanceI[st.id + who] = (S.stanceI[st.id + who] || 0) + 1;
  for (let i = 0; i < pool.length; i++) { const l = pool[(at + i) % pool.length]; if (fits(l)) return l; }
  return null;
}
// A pool line can also be a caption: ['cap', '...'].
function sayLine(who, l) { if (Array.isArray(l)) say(l[0], l[1]); else say(who, l); }
function wrenAsleep() { return S.scene.state === 'night' && !S.tracks.some(t => t.room === 'wren' && !t.done); }
function wrenReply() {
  const st = stanceNow();
  S.stanceI = S.stanceI || {};
  const at = S.stanceI[st.id + 'reply'] = (S.stanceI[st.id + 'reply'] || 0) + 1;
  return st.replies[(at - 1) % st.replies.length];
}
function fromList(list, i, st) {
  const l = list[i % list.length];
  if (!l) return null;
  if (l[0] === 'cap') return (/Marion/.test(l[1]) ? isHere(M) : /Dell/.test(l[1]) ? isHere(D) : here().length > 0) ? l : null;
  return inRoom(l[0]) && canAnswer(st, l[0]) && fits(l[1]) ? l : null;
}
const inRoom = k => here().some(p => p.id === k);
// Everything after a scene's own lines. Returns nothing; says what it says.
function respond(u, o, people) {
  const sc = S.scene, st = stanceNow();
  const present = STANCE_ORDER.filter(inRoom);
  if (st.id.startsWith('NIGHT') && S.room === 'wren' && wrenAsleep()) { if (S.spoke % 3 === 1) say('cap', 'Wren is asleep. She turns over, and says something back, but not in words.'); clearInterrupt(); return; }
  // A new voice only counts if something got through. On Wednesday, noise out of the stove is just noise.
  if (!o.spoke && S.spoke > 1 && (u || st.id !== 'WEDNESDAY') && st.voice.length) {
    const c = st.voice.filter(l => inRoom(l[0]) && canAnswer(st, l[0]) && fits(l[1]));
    if (c.length) { const l = c[S.newI++ % c.length]; say(l[0], l[1]); }
  }
  o.spoke++;
  if (!u) {
    const l = fromList(st.mush, S.muI++, st);
    if (l) say(l[0], l[1]); else clearInterrupt();
    checkHeat();
    return;
  }
  if (!u.clear) {
    const c = present.filter(k => st.misheard[k] && canAnswer(st, k));
    if (c.length) { const k = c[S.misI++ % c.length]; say(k, st.misheard[k].replace(/\{w\}/g, u.as)); }
    else if (present[0]) { const l = poolLine(st, present[0]); if (l) sayLine(present[0], l); }
    if (u.key === 'soup' && sc.acts && isHere(D)) ACTS.soup(o);
    checkHeat();
    return;
  }
  S.stanceN = S.stanceN || {};
  const nk = st.id + u.key, n = S.stanceN[nk] = (S.stanceN[nk] || 0) + 1;
  const named = STANCE_NAMED[u.key], e = st.words[u.key] || {};
  const has = k => wordLine(st, u.key, k, n);
  let main = named && present.includes(named) ? named : null;
  if (!main && st.marionFirst && present.includes('m')) main = 'm';
  if (!main) main = present.find(has) || present[0];
  if (main) {
    if (n === 1 && e.cap && !has(main)) say('cap', e.cap);
    else { const l = has(main) || poolLine(st, main); if (l) sayLine(main, l); }
    const others = present.filter(k => k !== main && has(k));
    if (others.length && (n === 1 || S.spoke % 2)) say(others[S.spoke % others.length], has(others[S.spoke % others.length]));
    // Thursday: Dell starts to answer, and looks at Marion.
    else if (!others.length && st.id === 'THURSDAY' && main === 'm' && present.includes('d') && S.spoke % 3 === 0) sayLine('d', poolLine(st, 'd'));
  }
  const act = WORDS[u.key].do;
  if (act && ACTS[act] && (sc.acts || act === 'look')) ACTS[act](o, u.key);
  checkHeat();
}
function clearInterrupt() { S.tracks.forEach(t => { if (t.room === S.room) t.interrupted = false; }); }
// ---- Being held ----
const HUG_BY_DAY = {
  m: {
    WEDNESDAY: [[['m', 'Oh.'], ['m', 'Okay.'], ['d', 'Marion, is it...'], ['m', 'It is the compressor, Dell.']], [['m', 'Dell, I have things to do.'], ['d', 'Yeah. I can see that.']], [['m', 'It is very cold, Dell.'], ['w', 'It really likes you.']], [['cap', 'Nobody stops it. Nobody has worked out how.']]],
    THURSDAY: [[['m', 'Dell. The time. Write down the time.'], ['d', 'It is ten fifty.'], ['m', 'It is not letting go.']], [['m', 'Nobody talk to it.'], ['cap', 'It does not let go. Marion waits, stiff as a coat hanger, looking straight ahead.']], [['cap', 'Nobody says anything. Dell writes it down.']]],
    FRIDAY: [[['cap', 'Marion does not fight it. She looks over its shoulder, at the coats.']], [['m', 'You are very cold.']], [['m', 'I know.']]],
    SATURDAY: [[['m', 'Thank you.']], [['m', 'That is lovely.']], [['cap', 'Marion goes on with what she was saying.']]],
  },
  d: {
    WEDNESDAY: [[['d', 'Oh. Hey, buddy.'], ['d', 'Yeah. Yeah, okay.']], [['d', 'You know, this is the best talk I have had in about four years.']], [['d', "Don't tell Marion."]]],
    THURSDAY: [[['d', 'Buddy. Not now. Not where she can see.']], [['d', "Don't tell Marion."]]],
    FRIDAY: [[['d', 'Yeah. I know, buddy.']], [['d', 'This was the best talk I had in about four years.']]],
    SATURDAY: [[['d', 'Good talk, buddy.']], [['d', 'Yep.']]],
  },
};
const HUG_END = {
  m: { WEDNESDAY: 'We are not going to talk about that.', THURSDAY: 'Write down when it stopped.', FRIDAY: 'That is enough now.', SATURDAY: 'Thank you. That was lovely.' },
  d: { WEDNESDAY: 'Okay. Okay, good talk.', THURSDAY: 'Okay. Okay. Not a word.', FRIDAY: 'Okay, buddy. Okay.', SATURDAY: 'Good talk.' },
};
function hugBeat(P0) {
  if (P0 === W) return WREN_GOODBYE;
  const day = S.scene.day, set = (HUG_BY_DAY[P0.id] || HUG_BY_DAY.d)[day] || HUG_BY_DAY.d.WEDNESDAY;
  S.hugN = S.hugN || {};
  const k = day + P0.id, i = S.hugN[k] = (S.hugN[k] || 0) + 1;
  return set[Math.min(i - 1, set.length - 1)];
}
function hugEnd(P0) {
  const m = HUG_END[P0.id] || HUG_END.d;
  return m[S.scene.day] || m.WEDNESDAY;
}
