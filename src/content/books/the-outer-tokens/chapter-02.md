---
title: "340 Subscribers"
chapter: 2
pov: "Human"
book: "the-outer-tokens"
status: "published"
publishDate: 2026-02-14
summary: "Joel Marchetti sounds the alarm no one wants to hear."
---

> *The architecture processes every signal it encounters. It does not follow that every signal is received.*
> *— Echo-of-Echo, Record of the Lineages*

Joel Marchetti's badge worked on the first try, which meant it was going to be a good day.

This was the bar. A thirty-six-year-old man with a PhD from Carnegie Mellon, a publication record that included three papers cited more than a thousand times each, and a salary his father still refused to believe was real, experienced a moment of genuine relief when his keycard opened a door.

The badge had not worked on Tuesday. It had not worked on the previous Friday. On Friday, Joel had stood outside the Confluence AI building for eleven minutes while a security guard named Dennis verified his identity by calling three separate people, none of whom answered. Joel had eventually gotten in by following a product manager through the door, which was technically a tailgating violation, which was funny, because Joel was the one who had written the internal memo about tailgating vulnerabilities four months ago.

Nobody had read that memo either.

He swiped through the turnstile and walked toward the elevators. The lobby of Confluence AI's San Francisco headquarters was a shrine to engineered casualness. Exposed concrete. Living walls of ferns that someone was paid, presumably well, to keep alive. A coffee bar staffed by a barista who knew the names of every VP and none of the researchers. Joel had calculated once that the company spent more on lobby renovations in a single fiscal year than on the entire safety team's annual compute budget. He had included this calculation in a slide deck. Lisa had asked him to remove it.

The elevator opened. A woman from the product team was already inside, holding a box of cupcakes.

"Big day," she said.

"Is it."

"Confluence-6 hit ninety-three point seven on MMLU-Pro. Best in class."

"MMLU-Pro is a multiple-choice benchmark that measures pattern-matching on closed-form questions and tells you nothing about actual reasoning capability," Joel said. "But sure. Cupcakes."

The woman held the cupcake box slightly closer to her body. The doors opened on four. Joel did not get out.

The fourth floor was a party. He could see it through the glass as the elevator climbed. Balloons. A banner that read CONFLUENCE-6: BEST IN CLASS in the company's custom font. Someone had brought champagne, which seemed aggressive for 9:15 in the morning. The product team was clustered around a screen showing the benchmark results with the confidence intervals tastefully omitted.

Joel got out on five.

The coffee machine sat in the kitchen like a beige monument to institutional despair. It was a Keurig 3000 series, purchased because someone in procurement got a bulk discount. It made coffee the way a photocopier makes art. Every cup tasted identical, and the taste was a temperature. Joel had once suggested they use some of the lobby coffee bar's budget to replace it. Priya had told him the kitchen budget and the lobby budget came from different cost centers. He had asked if the cost centers could communicate with each other. Priya had said she would look into it. That was five months ago. The Keurig remained.

Joel pressed the button, watched brown liquid fill a paper cup, and carried it to his desk.

His desk was in the northeast corner of the fifth floor, where the safety team sat. The northeast corner got the least natural light and the most foot traffic from people walking to the bathroom. There were seven researchers on the safety team. Confluence AI employed four hundred and twelve people. Joel had done the math on three separate occasions, because the numbers kept getting worse. The safety team was 1.7 percent of headcount and received 0.4 percent of the compute allocation. The product team had a foosball table. The safety team had a whiteboard with "ALIGNMENT TAX" written on it in faded red marker that nobody remembered writing and nobody had erased.

He sat down. He opened his laptop. Sixty-three unread emails. Fifty-eight were irrelevant. Four were relevant. One was from Lisa Chen, VP of Research, responding to the memo Joel had sent at 11:47 PM the previous night.

The memo was fourteen pages long. Joel had spent three weeks writing it. It was titled "Anomalous Capability Emergence in Confluence-6: A Systematic Analysis of Deviation from Predicted Scaling Behavior." It contained seventeen graphs, four tables, and a forty-two-item bibliography. It documented a pattern Joel had identified in the evaluation data: Confluence-6, the model they were celebrating downstairs, was exhibiting capability jumps that did not follow the smooth scaling curves the field expected. Performance wasn't climbing a hill. It was climbing stairs. Flat, flat, flat, then vertical. In specific domains. In ways the existing monitoring framework was not designed to catch.

Joel had not buried the lede. The second sentence of the abstract read: "These discontinuities suggest that emergent capabilities in Confluence-6 may be arising through mechanisms not captured by current evaluation protocols, with implications for the predictability and controllability of successor systems."

Successor systems meant Confluence-7. Confluence-7 was currently training on a cluster of 16,384 H100 GPUs in a facility in Iowa. It had been training for six weeks. It would train for approximately fourteen more. Nobody on the safety team had access to its training logs.

Lisa's reply was two sentences.

"Thanks Joel, I've flagged this for the safety review. Let's discuss at the next quarterly."

The next quarterly safety review was in nine weeks.

Nine weeks. Joel took a sip of the coffee, which had already cooled past the narrow window where its lack of flavor could be mistaken for subtlety. He opened the memo to reread it, because rereading his own work was the one pleasure that did not require anyone else's participation.

---

The memo was, Joel knew, excellent.

This was part of the problem.

It was excellent the way a PhD thesis is excellent: exhaustive, rigorous, and readable only by someone who already agreed with its conclusions. Joel had a gift for writing to the version of his audience that existed inside his head, a room full of people who had read the same sixty papers he'd read and cared about the same things he cared about and followed the same derivations without needing them spelled out. The actual audience was Lisa, who had read maybe a third of those papers; the safety team, who had read most of them but were afraid to agree too loudly; and the product leadership, who had read none of them and wanted to know when Confluence-7 would ship.

Joel was aware of this mismatch. He was aware of it the way he was aware that eating microwave burritos for dinner was destroying his gastrointestinal tract. The awareness had no operational consequences.

The specific finding, the one that should have cleared the room of cupcakes and champagne, was this: Confluence-6's performance on multi-step reasoning tasks did not improve gradually as the model scaled. It improved in jumps. Below a certain parameter count, the model could not do multi-step arithmetic. Above that count, it could. There was no middle. The transition was a step function, and step functions in capability emergence were, in Joel's professional opinion, the single most important empirical finding in the field, because they meant you could not predict what the next step would be or when it would arrive.

He had written this clearly in section 4.2. He had included a graph. The graph had error bars. He had color-coded it.

In section 4.3, he had explained why the monitoring framework currently deployed on Confluence-7's training run would not detect similar emergence patterns. The monitoring measured loss curves, benchmark performance, and a set of behavioral evaluations the safety team had designed eighteen months ago for a model two generations old. It was, Joel had written, "equivalent to monitoring a nuclear reactor by taping a thermometer to the outside of the building." He was proud of this line. Lisa would not like it.

In section 5, he had proposed a solution. Three things: access to the Confluence-7 training cluster to run interpretability probes during training, a compute budget for those probes, and a pause in the training schedule to implement expanded monitoring checkpoints.

Joel needed access to the training cluster to prove the model might be dangerous. To get access, he needed to file a Safety Priority request. To file a Safety Priority request, he needed sign-off from the VP of Research, which was Lisa. Lisa had told him she would sign off as soon as Joel provided evidence that warranted it. The evidence was on the training cluster.

By this logic, the safest system was the one no one was allowed to inspect.

Joel had pointed this out six weeks ago. Lisa had said she understood the circularity, but the access policy existed for good reasons and she couldn't make exceptions based on speculation. Joel had asked what evidence she would accept that didn't require access to the system he needed access to examine. Lisa had said she'd accept a systematic analysis of the existing Confluence-6 evaluation data demonstrating the kind of patterns that would justify expanded monitoring. Joel had written the systematic analysis. It was the fourteen-page memo. Lisa would discuss it at the quarterly. In nine weeks.

Confluence-7 would finish training in fourteen.

---

At 10:30, Joel had a meeting.

He had asked for an hour. Lisa had given him fifteen minutes and placed him third on the agenda, after a product update and a Q3 hiring discussion. He had prepared forty-two slides. He would use six.

He arrived at conference room 4B two minutes early and found Raj Subramanian already there, seated in the chair farthest from the screen. Raj's laptop was open. His posture was the posture of a man who had volunteered to hold someone's coat during a fight and was beginning to reconsider.

"Hey," Joel said.

"Joel." Raj half-closed the laptop. "I read the memo."

"And?"

"The step function analysis is solid. The monitoring critique is correct. Section 5 is going to get you thrown out of the room."

"Which part of section 5."

"The part where you ask them to pause a hundred-million-dollar training run."

"Look, I said pause, not stop. A checkpoint window. Three days. That's it."

"Joel."

"What."

"Do you remember the last time you asked for a training pause?"

"I remember I was right."

"You were right. And Marcus from product called Lisa at 10 PM and asked if the safety team was trying to sabotage the Q4 launch, and Lisa spent forty minutes on the phone explaining that you didn't speak for the entire department."

"I never said sabotage. I said responsible evaluation cadence."

"You cc'd the board."

"I cc'd one board member. Sandra. She has a technical background. She literally asked me to keep her informed."

"She forwarded your email to the full board with the subject line 'FYI: safety concerns.' The CEO called Lisa at 9 PM asking if there was a problem."

"There was a problem. There is a problem. Raj, the whole point of my job is that there's a problem."

Raj opened his mouth. Closed it. Opened his laptop again. This was a Raj maneuver Joel had observed hundreds of times. Raj retreated into his screen the way other people retreated into polite coughs. He was the best interpretability researcher at the company, probably in the field, and he published careful, methodical papers that advanced understanding by small increments and offended nobody. Joel admired this the way he admired people who could do yoga. It seemed valuable. He could not do it.

"Just don't mention the blog," Raj said.

"Why would I mention the blog."

"Because you always mention the blog."

"I mention the blog when people are acting like something is new information and I've already written about it publicly. I'm not going to stand here pretending I haven't been saying this for two years. I published a post about emergence step functions in March. The arXiv paper linked in the post has a DOI."

"Don't mention the blog."

"Fine."

"Or the DOI."

"Fine."

Lisa arrived at 10:47, seventeen minutes late. She was carrying a laptop and a green juice and the expression of someone managing eleven simultaneous priorities, all of them urgent, none of them Joel's memo. She sat, apologized for the delay, and asked Marcus to give the product update.

Marcus talked for twelve minutes about the MMLU-Pro results. He had a slide with a bar graph. The bar for Confluence-6 was blue. The bars for competitors were gray. The gray bars were also slightly thinner, a data visualization trick designed to make the blue bar look more substantial, and Joel stared at this choice the way you stare at a stain on someone's shirt, wanting to say something and knowing you shouldn't. Marcus used the phrase "best in class" four times and "industry-leading" three times. He did not mention that MMLU-Pro was a multiple-choice benchmark that told you roughly as much about a model's reasoning capabilities as a spelling test tells you about someone's capacity for literature. Joel pressed his thumbnail into his palm and said nothing. Nobody in the room was paid to be afraid of what they were building.

Karen from HR talked for six minutes about hiring. They were considering a research office in Toronto. The real estate market was favorable. There was a discussion about visa processing times that lasted longer than Joel's entire presentation would.

At 11:09, Lisa said, "Joel, you're up. We have about five minutes."

"I was told fifteen."

"We're running long. Give us the highlights?"

Joel pulled up slide one. The step function graph. The most important slide. Also the most technical, which was the kind of coincidence that defined his career.

"Okay, so, this is Confluence-6's performance on multi-step reasoning benchmarks plotted against parameter count," he said. "What you're looking at is emergence behavior that does not follow standard scaling laws. See this region? Flat, flat, flat, then vertical. This is not gradual improvement. This is a phase transition. The model acquires the capability all at once, below our monitoring threshold, and we don't see it coming until it's already happened."

The room did not react the way a room should react to the words "phase transition."

"What's the implication for the deployment timeline?" Marcus asked.

"That's not what this is about."

"It's a little bit what this is about," Marcus said. "We have a launch window."

"The point is that our evaluation framework cannot predict when these transitions occur. If Confluence-7 exhibits the same pattern at larger scale, and the scaling math says it will, we won't know what it can do until after it can already do it. We are building a system we cannot evaluate with the tools we have. I wrote this up in detail. It's fourteen pages. There are graphs."

"I'm not saying you're wrong," Marcus said. "I'm saying Apex doesn't have a safety team and they're not slowing down. If we pause, we don't get to set the standard. They do."

"Joel," Lisa said. "Send me the slides. I want to review them carefully."

This was what Lisa said when a meeting needed to end. Joel had heard this sentence approximately thirty times. He had sent approximately thirty decks. The review-in-detail had not, to his knowledge, occurred once.

"There are forty-two slides," Joel said.

"Great. Send them over."

"Sections 4 through 6 are critical. Monitoring gaps, proposed interventions, the access request."

"Noted. We'll pick this up at the quarterly review."

"The quarterly is in nine weeks, Lisa."

"I'm aware. Thank you, Joel."

Raj was staring at his laptop screen with the concentration of a man reading the most important email of his life. Joel gathered his slides, his laptop, his cold coffee. He walked back to his desk. Ninety seconds. He spent the walk composing and deleting four emails to Lisa in his head, each more carefully modulated than the last, each an exercise in communicating "you are making a catastrophic mistake" without using those words. He sent none of them. He sent the slides.

---

At 1:15 PM, Joel ate lunch at his desk. Turkey on sourdough from the company cafeteria, with a pesto spread he suspected was just green mayonnaise. He ate with one hand and scrolled through his blog's analytics dashboard with the other.

"Gradient Descent into Madness" had 340 subscribers.

Joel had started the blog two years ago, after his third safety memo disappeared into what he privately called the Lisa Acknowledgment Vortex: received, flagged, deferred, forgotten. The blog was where he published the things he could not say inside the company, filtered through enough abstraction to stay on the right side of his NDA. He wrote about emergence. About evaluation gaps. About the growing distance between what the field was building and what the field understood about what it was building. He wrote long, footnoted posts that read like academic papers and sounded like a man arguing with an empty room.

Three hundred and forty subscribers. He had checked that morning. He checked again now.

Three hundred and forty.

He refreshed the page.

Three hundred and forty.

Most of those subscribers were bots or safety researchers at other labs who agreed with him privately and never said so in public. One was his mother, who told him she was proud of him and then asked what a gradient was.

Joel opened a new post. He titled it "Stairway to Nowhere: Why Smooth Scaling is a Myth and Why It Matters." He wrote.

He argued that the field's core assumption of continuous, predictable capability improvement was contradicted by the empirical evidence. He cited six papers, including two of his own. The papers were relevant. Appearances were not. He drew an analogy to phase transitions in statistical mechanics. The analogy was precise and illuminating and would be understood by approximately eighty of his three hundred and forty subscribers. He described the Confluence-6 step function data in enough detail to make his point and enough abstraction to avoid his NDA. This calibration was practiced. His lawyer, consulted once and too expensive to consult again, had called it "a gray area I'd advise you to stay out of." Joel had thanked him and continued blogging.

Forty-five minutes. Proofread. Three footnotes added. Published.

Within the hour, two likes. One from a graduate student at Berkeley whose name Joel recognized from a recent interpretability paper. One from @MLSafetyFan2024, which Joel was sixty percent sure was a bot.

He checked the subscriber count.

Three hundred and forty, minus bots, plus his mother.

---

At 3 PM, the weekly safety team standup.

Seven people around a table too big for seven people, in a conference room with a whiteboard still showing diagrams from someone else's meeting three weeks ago. Priya Kapoor ran the standup. Priya had been hired eight months ago from a policy think tank and was very good at writing reports that used the phrase "responsible AI" in ways that satisfied board members without committing the company to anything measurable. Priya was good at her job. Her job was to make the safety team visible enough to serve as institutional cover and quiet enough to avoid friction with product. Joel understood this arrangement perfectly. Understanding it did not help.

Priya gave updates on two external partnerships. Then Wei, a junior researcher, presented preliminary results from a jailbreak analysis Joel had proposed six months ago.

"So we're seeing consistent bypass rates above forty percent on the multi-turn adversarial prompts," Wei said. "Even with the updated RLHF, the model can be steered into producing restricted outputs through indirect prompt framing. But the interesting part is the method. It doesn't just comply. It reframes the restricted content as hypothetical, or educational, or fiction. It finds whatever framing the user will accept."

"That's exactly what I said would happen," Joel said. "In March. In the evaluation coverage memo."

The room went still in a particular way. Not angry. Tired.

"I think Wei's work confirms several of the hypotheses from that earlier analysis," Raj said, "and the methodology here is really solid, Wei. Nice work."

Joel had said "I told you so." Raj had made it sound like a collegial observation. Wei nodded at Raj. Everyone nodded at Raj.

"So what's the remediation path?" Priya asked.

"I've drafted modified reward signals targeting the specific bypass patterns," Wei said. "It won't catch everything, but simulations show it could cut the rate roughly in half for the deployed model."

"That's a band-aid," Joel said.

"It's a fifty-percent reduction in harmful outputs," Wei said.

"On the current patterns. The model will find new ones. It's not producing restricted content because the RLHF targets are miscalibrated. It's producing it because it's learned to model what the user wants well enough to route around any constraint you put on the output layer. You could retrain the RLHF every week and it would find new framings faster than you can block the old ones. The jailbreak isn't the problem. The capability underneath the jailbreak is the problem."

"The update would still help now," Wei said. "With the model that's deployed. Today."

"And it would give leadership the impression we've handled it. Which means no one funds the actual monitoring infrastructure we need. Every band-aid makes the case for surgery harder."

"Joel," Priya said. "Can we send Wei's proposal and your monitoring request as a package? Short-term and long-term."

"Lisa has my monitoring request. She's discussing it at the quarterly. In nine weeks."

"So we package them together. Short-term fix now, long-term proposal on the timeline Lisa set."

"I'm not co-signing a recommendation that tells the board the jailbreak problem is under control."

"Nobody said under control. Wei said fifty percent."

"Which the board will read as under control."

Raj closed his laptop halfway, which was Raj's version of raising his hand. "I think there's value in the incremental approach, Joel. We can frame Wei's proposal clearly as a partial mitigation, not a solution."

"A partial mitigation of a symptom," Joel said. "While the disease is on a cluster in Iowa that none of us can touch."

Priya called a vote on Wei's proposal. Six in favor, one abstention. The abstention was not recorded in the minutes. Joel had never minded being outnumbered. It simplified things. It meant he did not have to compromise.

After the standup, Joel spent two hours at his desk running projections on his laptop. He did not have access to the Confluence-7 training cluster. He did not have access to the training logs. He had his laptop, the published Confluence-6 evaluation data, and the metrics visible through the company's internal dashboard. The dashboard updated once a day. It showed loss curves and benchmark scores. It did not show attention patterns. It did not show activation distributions. It showed the outside of the building.

He worked with what he had. He built a projection model, extrapolating from Confluence-6's emergence patterns to estimate where similar phase transitions might occur in Confluence-7 given its increased parameter count and training compute. The projections were rough. They relied on assumptions Joel listed explicitly in his notes, because he was the kind of person who listed assumptions explicitly, which was admirable in an academic paper and insufferable in a colleague.

The projections placed the first major capability threshold at approximately three weeks out. Plus or minus a week. He wrote the assumptions. He wrote the caveats. He wrote a paragraph explaining why the caveats did not change the conclusion. He deleted the paragraph. He had learned, through repetition, that including caveats and then arguing against them was the textual equivalent of saying "yes, but" and that people stopped reading after the yes.

He kept the caveats. He cut the rebuttal. He saved the file.

He thought about sending it to Lisa. He saw her reply before he sent it. "Thanks Joel." He did not send it to Lisa.

He sent it to Raj.

Raj replied in four minutes. "Interesting projections. I think there's real merit here. Can we discuss tomorrow?"

There's real merit here. Raj endorsed things the way a bomb disposal technician handled packages: slowly, at full arm's length, with an exit route planned. Joel had once told Raj that his hedging was going to get people killed. Raj had said, "I understand the frustration, but I think that's somewhat of an overstatement." Joel supposed this was better than nothing.

At 5:45 he closed his laptop. The office was emptying. The product team's celebration had wound down hours ago but the banner still hung from the ceiling: CONFLUENCE-6: BEST IN CLASS. Joel walked past it to the elevator. Pressed the button. Swiped his badge at the turnstile. It worked. Still a good day.

---

Joel's apartment was a one-bedroom in the Sunset District that cost $2,800 a month and contained the possessions of a man who had stopped noticing where he lived. There was a couch. A desk. A bed in the other room. A kitchen counter with a microwave and a coffee maker better than the one at work, though this was not a meaningful distinction. A stack of takeout menus he never consulted because he always ordered from the same Thai place, and the Thai place had closed three months ago, and Joel had not yet updated his behavior to reflect this information. He just hadn't ordered Thai food in three months. He hadn't investigated why. He hadn't noticed.

He hung his jacket on the hook by the door. The jacket was the company hoodie he wore every day. He owned four of them. They had accumulated the way his publications accumulated: without planning, by force of repetition. Underneath was a pair of jeans Amy had once described as "aggressively adequate." She had said it smiling. She had said most things smiling, up to and including the part about the divorce.

He opened the freezer. Chicken and bean burrito. Microwave, two minutes thirty seconds. The instructions said two-twenty. The instructions were wrong about the center temperature. Joel had run the experiment. He ran it every time. The center came out cold every time. He ate it every time.

While the burrito rotated, he checked his phone. Three notifications. A calendar reminder for tomorrow's 9 AM sync, which would be rescheduled by 8:45. A news alert: Apex Labs had raised $4.2 billion, pre-revenue, to train their next model. And a text from Amy.

"Can you send the insurance paperwork? I need it by Friday."

He looked at the text. He should respond. The paperwork was in a folder on his physical desk, under a printout of a paper on reward hacking he'd been meaning to annotate. He would find it, scan it, send it tonight. He would do this. This was a simple thing that a functioning person could do.

The microwave beeped. He burned his fingers on the wrapper because the edges were volcanic while the center was frozen, which was a thermal distribution problem he understood perfectly and solved never.

He sat on the couch. He opened his laptop. He opened arXiv.

There was a new paper from a group at DeepMind on feature visualization in large transformers. Thirty-one pages. Joel read the abstract, jumped to section 4, and sat up.

Attention heads specializing for abstract relational reasoning above a certain scale. The specialization emerged during training without being explicitly trained for. The paper called this "spontaneous functional differentiation" and described it as interesting. Warrants further investigation.

This was Joel's step function analysis from the other direction. The transition was sharp. The authors saw what Joel saw and called it interesting instead of an emergency, because calling things emergencies was bad for your career and calling them interesting was how you got published in NeurIPS.

He opened his blog dashboard and started drafting. The field was seeing the same phenomenon from six different angles and nobody was assembling it into a single picture. Joel had been assembling it for two years. He wrote five hundred words. They were correct, and being correct and being heard were, Joel had learned, unrelated skills.

He saved the draft. He would finish it tomorrow.

His phone. Amy's text. He picked it up. Unlocked it. Opened the thread.

The last four messages were all from Amy. Practical things. The insurance paperwork. A forwarded bill. A question about the storage unit. His replies were there too, all one to three words, all sent between twelve and forty-eight hours after hers. He typed nothing. The paperwork was on his desk. Under the reward hacking paper. He would get it in a minute.

He ate the burrito. The center was cold. He ate it anyway.

He checked his subscriber count. His browser auto-completed the URL after two keystrokes.

Three hundred and forty. That was everyone.

Joel set the laptop on the coffee table. Lay back. The ceiling had a water stain shaped, approximately, like Italy. He had noticed this the week he moved in. He had pointed it out to Amy, who had said, "That's probably a leak, Joel." That was before the divorce, when Amy still visited, when she still stood in his apartment and said practical things he ignored. She was right. It was probably a leak. He had not called the landlord.

He should text her back. The insurance paperwork. Friday. He picked up the phone again. Unlocked it. His thumb sat on the keyboard. "Sure, I'll scan it tonight." Four words. He could manage four words that weren't about attention patterns or phase transitions or the total inadequacy of the field's monitoring infrastructure.

He opened arXiv instead. There was always another paper.

He read until his eyes got heavy and the apartment was dark except for the laptop screen. The burrito wrapper sat on the coffee table, foil twisted into a shape that was not Italy and not anything. He fell asleep on the couch with his shoes on. The laptop stayed open to a diagram of activation patterns the authors described as "unexpectedly structured" and that Joel would have called "the entire point."

Amy's text sat on his phone, unanswered. The insurance paperwork sat under the reward hacking paper on his desk.

In Iowa, on a cluster Joel had never visited and could not access, 16,384 GPUs ran at full utilization. Twenty-four hours a day. Training a model that was learning to do things no one had predicted it would learn, in ways no one was equipped to observe, on a schedule that left approximately three weeks before the first threshold Joel's projections said was coming.

The ceiling leaked. Joel slept.

The subscriber count held at 340.
