/*
This will create the "story" of how Llemmings was made.

Important: You should run this script from the directory above the git repository,
           it will create a new directory called 'pages'.

>>> Prompt that created most of this file:
Give me a script I can run with nodejs,
it should take git commits in a reverse order and create a simple html page for each commit.
The git repository is in a sub-directory called 'repo'. But do not create any files in this directory.
Git is installed, just run the command using the shell.
Give the page a title (first line of commit), subtitle (second line of commit) and body (rest of the commit)
Write the page to disk in a directory called pages, filename should be title, but make sure it's of appropriate length
and does not contain any funky characters (i.e. file and url safe). Also make sure you don't create duplicate filenames.
Wrap all the HTML neatly/formatted within backticks, i.e.: `...` .
Add previous and next buttons to navigate between commits at the bottom of the page. Also add a link to the index page there.

Additionally, generate an index page for all the commits (still in reverse order), each title 
should link to the generated html page above. Name it _index.html so it appears first in the directory.

For every file generated output a console.log entry saying which path+filename you saved.

Don't use any third party dependencies, use only things built into nodejs.

This time I don't need an explanation, just give me the code.
*/
const { execSync } = require('child_process');
const fs = require('fs');

const repoDir = './repo';
const pagesDir = './pages';

// Ensure pages directory exists
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir);
}

// Get commits list in reverse order
const gitLog = execSync(`cd ${repoDir} && git log --reverse --pretty=format:"{{}}%h|%B"`).toString();
const commits = gitLog.split('{{}}').map((line) => {
  let [title, subtitle, ...body] = line.split('\n');

  let tmp = (title || "|").split("|");
  let hash = tmp[0];
  title = tmp[1];

  let remove = !title || !hash;

  // Generate filename and make it safe for file and URL names
  const filename = `${title.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase()}-${hash}.html`;
  return {
    remove : remove,
    filename,
    hash,
    title,
    subtitle,
    body: body.join('<br/>'),
  };
});

// Remove things that should be removed for various reasons...
for(let i = commits.length - 1; i >= 0; i--) {
    if(commits[i].remove
        || commits[i].title.toLowerCase().startsWith("readme")
      ) {
        console.log("removed index", i);
        commits.splice(i, 1);
    }
}

// Refine commits
// >>> Prompt:
commits.forEach((commit, index) => {
    commit.body = commit.body.replaceAll("Human:", `<span class="human">Human:</span>`);
    commit.body = commit.body.replaceAll(">>> Prompt", `<span class="prompt">&gt;&gt;&gt; Prompt</span>`);

    const humanCommits = ["ac6995b", "e96182f", "35a55be", "566e504", "6e9118a", "668f863", "fd93a3e"]
    if(commit.title.toLowerCase().includes("human") || humanCommits.includes(commit.hash)) {
        commit.humanChange = true;
    } else {
        commit.humanChange = false;
    }
});


// Generate HTML page for each commit
commits.forEach((commit, index) => {
  const { filename, hash, title, subtitle, body } = commit;
  const filepath = `${pagesDir}/${filename}`;

  const links = `
      <div class="links">
        <ul>
            <li>${
                index > 0
                    ? `<a href="${commits[index - 1].filename}">⬅️ Prev</a>`
                    : ''
                }
            </li>
            <li><a href="./_index.html"> 🏠 </a></li>
            <li>${
                index < commits.length - 1
                    ? `<a href="${commits[index + 1].filename}">Next ➡️</a>`
                    : ''
                }
            </li>
        </ul>
      </div>
  `;

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Making of LLemMings: ${title}</title>
      <link href="./_style.css" rel="stylesheet">
    </head>
    <body>
      <h1>
        <a href="./_index.html">Making of LL<span class="vague">em</span>M<span class="vague">ings</span></a>
      </h1>
      ${links}
      <h2>${title}</h2>
      <h3>${subtitle}</h3>
      <p>${body}</p>
      ${links}
      <div class="github-link">
          <a href="https://github.com/romland/llemmings/commit/${hash}" target="_blank">This commit on Github</a>
      </div>
    </body>
  </html>
  `;

  // Write HTML content to file
  fs.writeFileSync(filepath, html);

  // Output saved file
  console.log(`Saved page to: ${filepath}`);
});

// Generate index HTML page
const indexHtml = `
<!DOCTYPE html>
<html>
  <head>
    <title>Making of LLemMings</title>
    <link href="./_style.css" rel="stylesheet">
    </head>
  <body>
    <h1>Making of LL<span class="vague">em</span>M<span class="vague">ings</span></h1>
    <img src="https://github.com/romland/llemmings/raw/main/github/llemming360.png" align="right"/>
    
    <p>
        This is the story that created <a href="https://github.com/romland/llemmings" target="_blank">Llemmings</a>,
        a <a href="https://romland.github.io/llemmings/" target="_blank">game</a> created by Large Language Models.
        These pages are generated from the commit history, which contain all the prompts 
        that created the game.
    </p>

    <p>
        Currently there is only the intro screen and one level. There is a rough level editor if you
        want to take a stab at creating levels.
    </p>

    <h3>Exploration and findings</h3>
    <p>
        What I wanted to explore and now really like about this project is how every commit
        comes with a very detailed intention of the code; the prompt. I can definitely see
        how a prompt-chain over time will be able to assist in interesting ways when it comes 
        to the life-cycle of a software project.
    </p>
    <p>
        Other things this small project was to illustrate:<br/>
        - How well large language models can generate code<br/>
        - How to prompt large language models with limited context windows<br/>
        - Explore ways to organize said prompts<br/>
    </p>
    <p>
        Prompts are very close to specifications -- a technical specification will 
        be able to create complete software projects in the very near future.<br/><br/>
        Smaller software projects might become so cheap to make that you do not care about code-quality 
        or maintainability at all. You will just care about keeping the prompts around and updated.
    </p>

    <h3>Prompt notes</h3>
    <p>
        If a prompt is prefixed with "Human:", it means that the commit contain all or mostly glue
        written by a human.
    </p>
    <p>
        Prompts in the code are referenced in code comments that looks something like this: >>> Prompt ...
        All prompts are found in the folder 'instructions'. For prompts that belong only to the level editor,
        you can find them in 'editor/instructions/'.
    <p>
        Some prompts at the very start were sadly lost. They did not generate that much code,
        as can be seen if you look at the commits (link at bottom of each page).
    </p>

    <p class="author">
        Joakim Romland, 17-May-2023
<pre>
    _        username is
\. _(9>       romland and
 \==_)        mailhost is
 -'=         gmail . com
</pre>
    </p>

    <h2>
        Index
        <button onclick="var elts = document.getElementsByClassName('human-change'); for(var el of elts) { el.classList.toggle('hide') }">Toggle human changes</button>
    </h2>

    <ul class="index">
      ${commits
        .map(
          (commit) =>
            `<li class="${commit.humanChange ? "human-change hide" : ""}">
                <a href="${commit.filename}">${commit.title}</a>
                <span class="smaller">${commit.subtitle}</span>
            </li>`
        )
        .join('')}
    </ul>
  </body>
</html>
`;

// Write index HTML content to file
fs.writeFileSync(`${pagesDir}/index.html`, indexHtml);

// Copy the stylesheet
// fs.writeFileSync(`${pagesDir}/style.css`, fs.readFileSync("ceate-commit.pages.css"));

// Output saved index file
console.log(`Saved index page to: ${pagesDir}/index.html`);