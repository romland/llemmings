# 💚💙 Llemmings 💙💚

<img width="30%" align="right" src="./llemming360.png">

**Human**  
_Give me definition, usage and phonetics of "llemming". Which is a play on the acronym LLM (Large Language Model)_  

**OpenAI's ChatGPT**  
_Phonetics:_  
/ˈlɛm.ɪŋ/ (LEM-ing)

_Definition:_  
To mindlessly follow the predictions or suggestions of a language model without considering their validity, similar to how a lemming blindly follows its comrades off a cliff.

_Usage:_  
Don't just llemming your writing to the suggestions of a Large Language Model; make sure you double-check for accuracy and context before adopting any changes.

<br clear="right"/>

## Blindly following comrades: Encouraged
Llemmings is a game being made by Large Language Models (LLMs), like ChatGPT or GPT-4.
The intention is that no code is written by a human.

**The job, as a human, is to copy and paste code.**

The latest and greatest version is [here](https://romland.github.io/llemmings)!   

![Alt text](latest.png?raw=true "Screenshot of Llemmings")


## 🎮 The game
It is (probably) not yet a game. But ...

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

(I must stress: non-OpenAI models are most welcome).


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
The prompts are in the code now. This is not going to hold much longer. So I need to figure out how to
best connect prompts to code to have them available for easy copy/pasting. It could be that I need
to implement something outside of this project for that.  

Once figured out, there should be notes here about how you organize your prompts with the code!  


## 🤓 Now we know
_Human_  
```
Write me one of those cute grammatical definitions with phonetics and stuff where you 
say what "llemming code" is so I can put it on project page on github. The double-l with 
the m in llemming is a word-play on LLM, btw.
```

The truth-teller _ChatGPT_
> Certainly, here you go!
> 
> **Title:** Definition of "Llemming Code"
> 
> **Phonetics:** /’lɛmɪŋ kəʊd/
> 
> **Definition:**
> 
> "Llemming code" is a term for any code written with poor practices, often hastily put together and copied from other sources without proper understanding or evaluation. The name is a word-play on the acronym LLM, which stands for “low-level maintenance” and reflects the lack of care given to the codebase.
> 
> Despite its whimsical name, Llemming code can have serious consequences for software projects, leading to bugs, vulnerabilities, and decreased performance. Such code may also be difficult to maintain due to its disorderliness, unreliable structure, and tendency to break. Hence, it's considered bad coding practice.
> 
> It's important to avoid the writing of llemming code and adopt clean coding practices for the proper functioning and longevity of the software.


## 🔥 Code and quality
Up til now, quality has not been a big concern. It's one giant steamy pile of spaghetti (llemming code?).

It's been handy to have everything in one file for prompting. The instructions to the LLMs (prompts)
will sadly have to be separated from the code in the near future, it's getting too much.

At some point down the line, probably soon, refactoring needs to be done by the LLM (😱). The `update` function in the `Lemming`
object is especially unwieldy. To the point where I grin every time I see it.


### 🧠 Cheating
All written by language models, I say: there are a few exceptions, like it's allowed to remove redeclared 
variables and similar small things. But other than that, the code should be written by the LLM.

If you add/change code that you did not get from the LLM, make sure that it's marked 
with something like:

"// HUMAN: I Have no hair left. I ran out of patience. I, bad human, added this line."

This is essentially cheating. But we are humans, we cheat.

It turns out that the LLM is no better. It added this comment itself, making it look
like it was actually debugging: `// HUMAN: modified this line from -1 to 0 (the first pixel we need to remove is on the same row)`  

Added to prompt: `You are not human. You are not allowed to make comments where you pretend to be one.`


## 🚃 Contributing and pull requests
You can contribute. Don't be afraid. Blame the LLM.

Any pull requests are welcome, just make sure you  
...say which prompt(s) you used  
...say which LLM was used (if you want to be fancy, you can disclose temperature, etc)  

If you cheated, flag the line with a "HUMAN: ..." comment in the code.

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

Maybe the commit history will be the most interesting part of this project.


## 🏃‍♀️ Compiling, installing, running
Just open `index.html` in your favorite web-browser.


## 🚧 TODO
There is a lot. It would be nice if there was a list somewhere. There isn't. Just do what you want to do.

Some thoughts:
- make it pretty,
- animations (maybe their green hair should move in the wind, maybe they have legs!),
- shaders,
- sound,
- speech bubbles (Oh no!),
- add the missing types of green-blue blocks (the builder looks particularly nasty on paper),
- the goal of the game,
- score,
- better maps,
- levels,
- ... yeah ...


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

**Oh, woe is us.** 😲
