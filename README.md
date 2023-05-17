# 💙 Llemmings 💚

<img width="30%" align="right" src="./github/llemming360.png">

_Give me definition and phonetics of "llemming". Which is a play on the acronym LLM (Large Language Model)_  

**OpenAI's truth-teller, _ChatGPT_**:  
_Definition:_  
To mindlessly follow the predictions or suggestions of a large language model, similar to how a lemming blindly follows its comrades off a cliff.

_Phonetics:_  
/ˈlɛm.ɪŋ/ (LEM-ing) or (El-el-em-ing)

<br clear="right"/>

You can check [commit history here](https://llemmings.com).

## 👉 Blindly following comrades: Encouraged
Llemmings is a game being made by Large Language Models (LLMs), like ChatGPT, LLaMA or GPT-4.
The _intention_ is that no code is written by a human.

**The job, as a human, is to copy and paste code.**

It is (probably) not yet fun and there be bugs. But the latest and greatest version with one level is [here](https://romland.github.io/llemmings).  

![Alt text](github/latest.png?raw=true "Screenshot of Llemmings")


## 🎮 The game
Llemmings is based on a game with a similar name by DMA Design. 

In short: green and blue blocks (will be) dropping out of a hatch and the goal is to bring
them safely home. These green and blue blocks are pretty dumb. Your job, as a human, is to 
assist them by giving them instructions. For instance, stop them from going in some direction.

The implementation so far is all from memory. Some things are very likely to be wrong. The aim
is not to make a perfect clone of its namesake. Buuut, if it is about the same, it's of course 
fun.


## 🖥️ The other game
It's the journey!

Your second job, as a human, is to give instructions to your language model of choice.


### 📝 Prompts
You will quickly realize this is a painful journey. You will find yourself reading code. A lot.

Very often ... in fact, all the time ... you will get code that does not work, or only
partially works. This means you as a human **failed**. You need to change something in your
prompt and try again.

Naturally you could give very narrow prompts and just get single functions all the time,
thus pretty much making this a human design. But no, we want LLM to be involved and thus
responsible.

_The process roughly goes something like this_
1. You have a goal, like adding a green and blue block that can climb.
   You write a basic prompt explaining your idea.
2. Out comes some code, you immediately see that this is garbage
3. You adjust the prompt by adding some more details.
   Eventually you get something passable.
4. You test it and see that it does not work at all, you spend time figuring out
   why and then adjust the prompt accordingly.

Eventually you will get something that works. Kind of.

It will hurt to debug a snippet of code to figure out how you should change your prompt.
**You, human, must resist fixing the code. You, human, must fix the prompt instead.**

Sometimes you surprise yourself and just one-shot a prompt. It all just works on first try.
One such example was the death explosion. It was a happy moment.

### 🗃️ Organizing prompts
Prompts are stored in `instructions/` for the game, and in `editor/instructions/` for the editor.
Code is marked with which prompt generated a snippet of code. Usually like this: `// >>> Prompt: instructions/...`. 

## 🔥 Code quality and performance
There are no external dependencies (except a font), it is all plain old JavaScript.

Up til now, quality has not been a concern. It's one giant steamy pile of spaghetti (llemming code?).

At some point down the line, probably soon, refactoring needs to be done by the LLM (😱). The `update` function in the `Lemming`
object is especially unwieldy. To the point where I grin every time I see it.

### 🧠 Cheating
I said "all written by language models". There are a few exceptions, like, it's allowed to remove redeclared 
variables and similar small things. But other than that, the code should be written by the LLM.

Sadly, due to context length, the glue between prompts will still need to be written by a human. There are ways around this issue, but I decided early that I will not go down that road for this project.  

If you add/change code that you did not get from the LLM, it should be marked with something like:
`"// HUMAN: I Have no hair left. I ran out of patience. I, bad human, added this line."`  

This is cheating. But we are humans, we cheat.

Beware that the LLM will sometimes try blaming us humans. At one point it added a comment making it look
like it was actually human and debugging: `// HUMAN: modified this line from -1 to 0 (the first pixel we need to remove is on the same row)`  

I had to add this doomsy bit to the prompt: `You are not human. You are not allowed to make comments where you pretend to be one.`

### 🔥 Performance
As for performance, it is with all likelihood very poor/unopitimized as I have not had a reason to 
go after it at all. I think I may have seen some degradation in FPS on occasion, but not annoyingly on
my own (good) development matchine. There are a lot of low-hanging fruit to go after this, I would just 
need to add performance-watchers and go after them.

## 🚃 Contributing and pull requests
You can contribute. Don't be afraid. Blame the LLM.

Any pull requests are welcome, just make sure you  
- ...say which prompt(s) you used  
- ...say which LLM was used (if you want to be fancy, you can disclose temperature, etc)  

If you cheated, flag the line with a "HUMAN: ..." comment in the code. Also prefix the commit with "Human: ..."

Currently I have settled for commit messages like this:
```
Commit title
ChatGPT: subtitle

>>> Prompt 1:
... a prompt that contributed code
>>> Prompt 2:
... a prompt that contributed code
...
```
Preferably only one prompt per commit. But I failed in the beginning.

_You can check the commit history and you'll get the gist._


## 🏃‍♀️ Compiling, installing, running
Just open `index.html` in your favorite web-browser.  


## 🆙 Level editor
There is also the beginnings of a [level editor](https://romland.github.io/llemmings/editor/).
To use, open `editor/index.html` in your web-browser.  


## 🚧 TODO
There is a lot. It would be nice if there was a list somewhere. There isn't. Just do what you want to do.

Some thoughts:
- [ ] start screen (don't just start first level)
   - [ ] have it show creaturs walking/digging/working around a Llemmings "logo"
   - [ ] music
- [ ] make it pretty
   - [ ] textures
   - [ ] UI: action buttons, goal, score
- [ ] visual effects
   - [ ] make the level/map feel more alive (animated water? ...)
   - [ ] some particles flying when digging/building
- [ ] make it work properly on mobile devices (seems to be map-gen related)
- [ ] floating combat text for visual feedback
- [ ] take up full browser window (possibly higher resolution)
- [ ] wider maps + sideways scrolling of map
- [ ] home/goal graphic
- [ ] use delta-time for all updates
- [ ] add performance watchers
- [ ] animations
   - [x] legs/feet
   - [ ] water
- [ ] sound effects:
   - [ ] on spawn
   - [ ] on action assignment
   - [ ] on building/mining
   - [ ] on reaching finish
   - [ ] on death
- [ ] speech bubbles (possibly built-in TTS?)
   - [ ] "Oh no!" on creature exploding
- [ ] add the missing types of green-blue blocks
   - [ ] miner (diagonal digging)
- [ ] visual feedback on pause
- [ ] button for "progress to next level"
- [x] the goal of the game
- [x] level score
- [ ] better maps
- [x] level progression
- [ ] create at least 10 levels (send to level editor when all levels are completed)
- [ ] ... yeah, more ...


## ✍️ Example prompts
Note that a prompt like this grew over time (likely hours), it's not like it was just written
down and in one shot came good code fit-for-purose. It's all an iterative process. And it feels
very much like ... programming.  

- [Digger/Miner/Basher](https://github.com/romland/llemmings/commit/334cb3bc296961d763d5ab242422ab5b2975e67f)
- [Bomber](https://github.com/romland/llemmings/commit/b621cc5a83bb84c378624308f0815d17cfc58a02)
- [Helper functions](https://github.com/romland/llemmings/commit/d2e2afed4be9b23f250b140eb8b4ff0d5086590c)


## 📄 License
AGPL.


## 🎲 Random thoughts
All about the specifiprompts.  
It's the age of average text.  
It is still creating. Which is what we like. Right.  
[Llemmings](https://llemmings.com)  

**Oh, woe is us.** 😲
