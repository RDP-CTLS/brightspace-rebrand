// Build "Communicating with Students in Brightspace" from the seed, using the tool's own
// generators (card + cleanBody) + export (buildRestyle) + security gate (verify).
// Each block -> card(title, cleanBody(innerHTML), ...titleStyle(title)). Pages keyed by zip entry.
//   SAVE_DIR=<scratchpad> ORIGINAL=<seed.zip> dev/test-harness/run.sh tests/build-comms-course.js 90
const CONTENT = {
"01-how-communication-works.html": [
 ["The big picture",
  `<p>There is no single "Messages" inbox in Brightspace the way Blackboard had. Communication is spread across a few purpose-built tools, and almost everything a student receives lands in their institutional email (Outlook) or the in-platform notification bell &mdash; not in a Brightspace inbox they have to remember to open.</p>`],
 ["Two things to remember",
  `<p>These two truths explain almost every "my students didn't get it" question:</p><ol><li><strong>Most delivery is student-controlled.</strong> Whether a student is emailed about an announcement, a discussion post, or a grade depends on their own Notification settings &mdash; which you cannot set for them.</li><li><strong>When a message must land, use Classlist email.</strong> It goes straight to every selected student's inbox, regardless of their settings. (At RDP, publishing an announcement does not email it out on its own.)</li></ol>`],
 ["Which tool for what",
  `<table><tbody><tr><th>I want to&hellip;</th><th>Use</th><th>Reaches</th></tr><tr><td>Send a private note to one student or a section</td><td>Classlist email</td><td>Their Outlook inbox</td></tr><tr><td>Post a course-wide update on the homepage</td><td>Announcement</td><td>Homepage (email only if the student opted in)</td></tr><tr><td>Guarantee a course-wide message hits every inbox</td><td>Classlist email</td><td>Every student's Outlook</td></tr><tr><td>Automate a message when a condition is met</td><td>Intelligent Agent</td><td>Matching students' Outlook</td></tr><tr><td>Get students talking to each other</td><td>Discussion</td><td>Whoever subscribes to the topic</td></tr><tr><td>Control what I get emailed about</td><td>Notifications (your own settings)</td><td>Your inbox / the bell</td></tr></tbody></table>`],
 ["Coming from Blackboard",
  `<p>There is no internal Messages inbox, and announcements do not email the class by default. RDP left Blackboard in June 2026 &mdash; the Brightspace way is the current way.</p>`],
],
"02-email-classlist.html": [
 ["How email works here",
  `<p>Brightspace at RDP is not a mailbox. There is no inbox to check. You send outbound messages from the Classlist, and they are delivered to students' institutional email addresses. Replies come back to your Outlook, not into Brightspace.</p>`],
 ["Send an email from the Classlist",
  `<ol><li>Go to <strong>More &gt; Classlist</strong> (or Classlist in the navbar).</li><li>Tick the students you want, or use <strong>Select All</strong>. For a merged or multi-section course, use the <strong>Section</strong> dropdown to filter first.</li><li>Click <strong>Email</strong>.</li><li>Compose and <strong>Send</strong>.</li></ol>`],
 ["Watch for: keep a record",
  `<p>Classlist email saves no copy in Brightspace &mdash; there is no Sent folder. Add your own address in <strong>BCC</strong> so you keep a copy of what went out and when.</p>`],
 ["Good to know",
  `<ul><li>Recipients are normally Bcc'd, so students can't see each other's addresses or reply-all to the class.</li><li>Use Classlist email for private, one-to-one matters &mdash; not an announcement, which is public to the course.</li><li>Everything funnels to institutional Outlook. Students who don't check it will miss things &mdash; set that expectation in week one.</li></ul>`],
],
"03-announcements.html": [
 ["What announcements are for",
  `<p>Announcements are the course's homepage bulletin board &mdash; best for time-sensitive, course-wide updates, weekly messages, and reminders. Find them in the Announcements widget on the course homepage, or under <strong>Course Admin &gt; Announcements</strong>.</p>`],
 ["Create an announcement",
  `<ol><li>In the Announcements widget, click <strong>New Announcement</strong>.</li><li>Enter a Headline and Content (text, images, video, links).</li><li>Set Availability: a <strong>Start Date</strong> (leave it now to publish immediately, or set a future date to schedule ahead) and an optional <strong>End Date</strong> (the announcement disappears from the student view after it).</li><li>Add Attachments, or Additional Release Conditions to restrict who sees it.</li><li>Click <strong>Publish</strong> (or Save as Draft).</li></ol>`],
 ["Watch for: does publishing email the class?",
  `<p>No &mdash; at RDP, publishing an announcement does not email it out. It posts to the homepage, and a student is emailed only if they turned on Announcement notifications themselves. So for a message everyone must receive, use <strong>Classlist email</strong>. (D2L added a "Send Email Copy" checkbox in late 2025, but it is not enabled at RDP &mdash; verified September 2026.)</p>`],
 ["Watch for: after a course copy",
  `<ul><li>Old announcements carry over with their original dates. Delete or update them before term so students don't see stale, wrong-dated messages.</li><li>When you Copy to Other Courses, the person who copies becomes the listed author.</li></ul>`],
],
"04-notifications.html": [
 ["The hidden layer",
  `<p>Notifications are each person's own settings for what Brightspace tells them about and how. This is the layer behind most missed-message problems &mdash; including your own. Reach them at your name (top-right) &gt; <strong>Notifications</strong>.</p>`],
 ["What's in Notifications",
  `<ul><li><strong>Contact method:</strong> email (defaults to your institutional address). Delivery is email plus the in-platform bell, plus the Brightspace Pulse mobile app. Text/SMS notifications were retired in 2024.</li><li><strong>Summary of Activity:</strong> an optional daily or weekly digest per course.</li><li><strong>Instant Notifications:</strong> per-activity email toggles (announcements, discussions, grades, feedback, and more).</li><li><strong>Include grade value:</strong> whether the score itself appears in the email.</li><li><strong>Manage course exclusions:</strong> silence specific courses.</li></ul>`],
 ["The teaching point",
  `<p>You cannot set students' notifications for them &mdash; every switch is per-person and student-controlled. Two fixes: for guaranteed reach, use <strong>Classlist email</strong>; otherwise, teach students to set their own notifications (a first-week walkthrough works well). Note that Brightspace won't send notifications before a course's start date or after its end date &mdash; Classlist email still works then.</p>`],
],
"05-intelligent-agents.html": [
 ["What Intelligent Agents do",
  `<p>Intelligent Agents send an automated email when a condition you define is met &mdash; no login for a set number of days, a grade below a threshold, a missed submission. They are great for early intervention. Find them under <strong>Course Admin &gt; Intelligent Agents</strong>.</p>`],
 ["Set one up",
  `<ol><li>Course Admin &gt; Intelligent Agents &gt; <strong>New</strong>.</li><li><strong>Agent Name</strong> &mdash; for your reference; students don't see it.</li><li><strong>Status</strong> &mdash; an agent is disabled by default. Set it to enabled to run on schedule.</li><li><strong>Criteria</strong> (at least one): role in classlist, login activity (days since last login to Brightspace), course activity (days of inactivity in this course), or release conditions.</li><li><strong>Schedule</strong> &mdash; run manually, or on a schedule with a repeat interval. Choose "take action the first time only" or "every time" the user matches.</li><li><strong>Email</strong> &mdash; set the recipient, subject, and message.</li></ol>`],
 ["Personalise with replace strings",
  `<p>Replace strings fill in each recipient's details automatically. Common ones:</p><ul><li>{InitiatingUserFirstName}, {InitiatingUserLastName}</li><li>{OrgUnitName}</li><li>{LastCourseAccessDate}</li></ul><p>Example: "Hi {InitiatingUserFirstName}, we noticed you haven't been active in {OrgUnitName} recently&hellip;"</p>`],
 ["Test before you trust it",
  `<p>Always do a <strong>Practice Run</strong> first &mdash; it lists who would match and sends no email. Then Run Now, or let the schedule fire.</p>`],
 ["Watch for: after a course copy",
  `<p>Agents come across disabled &mdash; you must re-enable them each term &mdash; and their release conditions may not carry over. Re-enable, re-add the conditions, and practice-run before you trust it.</p>`],
],
"06-discussions.html": [
 ["Forums versus Topics",
  `<p>Discussions have two levels: <strong>Forums</strong> are containers (folders); <strong>Topics</strong> are where students actually post. Students can't post in a Forum &mdash; they need a Topic inside it. The most common mistake is creating a Forum but no Topic: students see the forum name but have nowhere to post.</p>`],
 ["Create a forum and topic",
  `<ol><li>Go to <strong>Discussions</strong> in the navbar.</li><li><strong>Create new &gt; Topic</strong>. Click Change Forum to place it, or let Brightspace create a forum of the same name.</li><li>Add a Topic Title and Description (the prompt). Set <strong>Grade Out Of</strong> to make it graded.</li><li>Under <strong>Availability Dates &amp; Conditions</strong>: start/end dates, release conditions, and Group and Section Restrictions.</li><li>Under <strong>Post &amp; Completion</strong>: default participation, hide-name, "must post before viewing others," and "posts must be approved before they display."</li><li>Toggle Visibility on, then Save &amp; Close.</li></ol>`],
 ["Grading and groups",
  `<ul><li><strong>Grading</strong> happens at the Topic level (not the Forum). Edit the Topic, set Grade Out Of, optionally attach a Rubric, then use Assess Topic to score each student's posts. Set the grade link up before students post.</li><li><strong>Group discussions:</strong> under Group and Section Restrictions, pick a Group Category. "One topic per group" auto-creates a separate thread per group; students see only their own group's posts. Grades are per student.</li></ul>`],
 ["Getting students notified",
  `<p>Discussion notifications need two things, both student-controlled: the student must <strong>subscribe</strong> to the forum or topic (the bell icon) and <strong>enable discussion notifications</strong> in their own settings. You can't do either for them &mdash; so post an announcement pointing to important discussions and set an expectation for how often students check.</p>`],
 ["If a student can't see a topic",
  `<p>Check these in order:</p><ol><li>Availability dates (a future start or a past end).</li><li>Hidden visibility (a crossed-out eye icon).</li><li>Group restrictions (a student not in any group won't see a group-restricted topic).</li><li>Release conditions.</li><li>A hidden or locked parent forum &mdash; it hides everything inside it.</li></ol>`],
],
"07-choosing-the-right-tool.html": [
 ["Quick rules of thumb",
  `<ul><li>Broadcast to everyone: <strong>Announcement</strong> (homepage). Need to guarantee an email: <strong>Classlist email</strong>.</li><li>Private matter with one student: <strong>Classlist email</strong>.</li><li>Students talking to each other: <strong>Discussion</strong>.</li><li>Automated check-ins: <strong>Intelligent Agent</strong>.</li></ul>`],
 ["Why didn't students get it?",
  `<table><tbody><tr><th>What happened</th><th>Why / what to do</th></tr><tr><td>Announcement posted, no email went out</td><td>Expected at RDP; students are emailed only if they opted in. For a guaranteed email, use Classlist email.</td></tr><tr><td>Discussion post nobody heard about</td><td>Students weren't subscribed and/or hadn't enabled discussion notifications. Neither is instructor-controlled.</td></tr><tr><td>Intelligent Agent stopped after a course copy</td><td>It copied over disabled and/or lost its release conditions. Re-enable, re-add, practice-run.</td></tr><tr><td>Classlist email "disappeared"</td><td>It was never stored in Brightspace; there's no Sent folder. BCC yourself.</td></tr><tr><td>Nothing arrives before term / after end</td><td>Notifications don't fire outside course dates; use Classlist email.</td></tr><tr><td>A student "gets nothing"</td><td>Check whether they read their institutional Outlook at all; everything funnels there.</td></tr></tbody></table>`],
],
};

await setFile(new File([await (await fetch('/original.zip')).blob()],'course.zip'));
if(!MODEL) return {ABORT:'setFile failed', errs:__errs};

// Confirm every content entry we plan to write exists in the model, and capture titles.
const entries = MODEL.zip.entries.map(e=>e.name);
const missing = Object.keys(CONTENT).filter(k=>!entries.includes(k));
if(missing.length) return {ABORT:'entries missing in seed', missing, entries};

const edits = {};
for(const [entry, blocks] of Object.entries(CONTENT)){
  const framed = blocks.map(([title, inner])=>card(title, cleanBody(inner), ...titleStyle(title))).join('\n');
  edits[entry] = { framed };
}

const blob = await buildRestyle(MODEL.zip, MODEL.man, MODEL.m, false, edits);
const v = await verify(blob);
const danger = (v && (v.danger!=null?v.danger:(v.dangers?v.dangers.length:0))) || 0;
if(danger > 0) return {ABORT:'security gate: danger>0', danger, verify:v, errs:__errs};

const name = 'Communicating with Students in Brightspace - Template Applied.zip';
await fetch('/save/'+encodeURIComponent(name),{method:'POST',body:blob});
return {
  saved: name,
  mb: +(blob.size/1048576).toFixed(3),
  editedPages: Object.keys(edits).length,
  danger,
  verifyKeys: v?Object.keys(v):null,
  verify: v,
  errs: __errs
};
