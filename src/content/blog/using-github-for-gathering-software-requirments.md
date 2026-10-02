---
title: "Harnessing GitHub for Open Requirements Gathering: A Key to Software Success"
date: 2025-02-17
description: "Learn how to leverage GitHub as a powerful platform for open requirements gathering, and how this approach can significantly enhance your software development process."
draft: true
---

I'm sitting in a 60-minute meeting to discuss "a new website."[^hypythetical] But what is this thing to which we are all referring? 

- What should it do? 
- Who should it speak to? 
- What tech stack should we use? 
- How should it be updated? 
- Who will maintain it and how?
- What are the key features and functionalities?
- What are the priorities?

A not-uncommon scenario in software development, this meeting is a microcosm of the challenges that arise when requirements are not clearly defined or understood. We often leave such a meeting with a plan to "get started" and "figure it out as we go." But this approach can lead to misunderstandings, misaligned expectations, and wasted time and resources.

[^hypythetical]: This is a hypothetical scenario, but it's one that many of us have experienced in some form or another.

As development methodologies evolve, there's a growing recognition of the importance of developing requirements "openly" – a practice that not only enhances transparency but also significantly boosts the likelihood of project success [@chanin2019collaborative].


GitHub, a platform traditionally associated with code version control, has features that can support open requirements gathering. By leveraging GitHub's collaborative features, we can create an environment where stakeholders, developers, users, and (if you're lucky to have them) project managers can collectively define, refine, and prioritize requirements in real-time.

Requirements developed in silos or in an ad hoc manner increase the risk of misalignment between what stakeholders envision, users want, and what developers deliver. Opportunities to maximize development time and effort can be missed. Open requirements gathering, on the other hand, ensures that all voices can be heard, potential issues are identified early, and there's a shared understanding of the project's goals and scope. 

Adopting an open requirements-gathering process directly contributes to software success while simultaneously increasing inclusion and a sense of community. By involving stakeholders throughout the requirements gathering phase, teams can:

- Reduce the risk of costly misunderstandings
- Increase stakeholder buy-in and satisfaction
- Adapt more quickly to changing needs or market conditions
- Improve overall product quality and alignment with business objectives

Perhaps most crucially, robust requirements gathering drives development. In many hundreds of conversations with software engineers, developers, and informaticians, a common question is "what *exactly* do you want me to work on?" Clear, community-driven requirements lead to concrete deliverables and provide a roadmap for developers, helping to prioritize features, allocate resources effectively, and maintain focus on delivering value. When requirements are well-defined and openly accessible, development teams can work with greater confidence and efficiency, leading to smoother project execution and better outcomes. 

With clear requirements, measuring progress becomes more straightforward, and stakeholders can easily track the project's status and ensure that it remains aligned with their expectations. This transparency fosters trust and collaboration, enabling teams to work together more effectively and deliver successful software products. Measurable progress builds confidence in the development process and empowers stakeholders and developers alike to build on success and learn from challenges. 

There is ample evidence in literature and across the web for the benefits of open requirements gathering. However, the question remains: how can we practically implement this approach in our software development projects? While not meant to be exhaustive, below is a list of considerations and potential ways to use GitHub as a platform for open requirements gathering:

1. Use GitHub Issues for requirement documentation: Create issues to represent individual requirements, user stories, or feature requests[@AidrivendevcommunityResourcesPrompts] [4], allowing for for easy tracking, public discussion, and prioritization of requirements.

2. Implement a labeling system: Use labels to categorize and prioritize requirements, making it easier to filter and manage them[4] [6].

3. Utilize GitHub Projects: Create project boards to organize and visualize requirements, allowing stakeholders to see the progress and status of each item[@AidrivendevcommunityResourcesPrompts].

4. Leverage GitHub Wiki: Use the Wiki feature to create comprehensive documentation for requirements, including detailed specifications, user stories, and use cases[@AidrivendevcommunityResourcesPrompts].

5. Encourage stakeholder participation: Invite stakeholders to comment on issues, participate in discussions, and provide feedback directly within GitHub[@crystal-ornelasGuideUsingGitHub2021] [6].

6. Implement a hierarchical structure: Use issue references and naming conventions to create a hierarchy between main requirements and sub-requirements or tasks[4].

7. Conduct requirements workshops: Organize virtual or in-person workshops using GitHub as a central platform for documenting outcomes and action items[@AidrivendevcommunityResourcesPrompts].

8. Use pull requests for requirement reviews: Create pull requests for major requirement changes, allowing stakeholders to review and approve modifications[@crystal-ornelasGuideUsingGitHub2021].

9. Integrate with external tools: Consider integrating GitHub with specialized requirements management tools for more complex projects[9].

10. Ensure that non-technical users are comfortable with GitHub: Provide training and support to stakeholders who may be less familiar with the platform, ensuring that everyone can participate effectively OR consider using a more user-friendly interface that integrates with GitHub.

By leveraging these GitHub features, you can create a collaborative and transparent environment for gathering and managing requirements throughout the software development process.

## working with non-technical stakeholders

One of the key challenges in open requirements gathering is ensuring that non-technical stakeholders can effectively participate in the process. GitHub, while a powerful platform for developers, may not be as intuitive for users who are less familiar with version control systems and software development workflows. Furthermore, anonymity can be a barrier to participation, as GitHub requires users to create an account to interact with issues directly.

There are third-party tools that can sit "over" GitHub issues to facilitate community requirements gathering and prioritization. These tools can provide a more user-friendly interface, support anonymous submissions, and integrate with GitHub to sync requirements and feedback. 

External feedback tools can help bridge the gap between technical and non-technical stakeholders, making it easier for a wider range of users to contribute to the requirements gathering process. [UserVoice](https://uservoice.com) allows anonymous submissions and can sync with GitHub issues. [Canny](https://canny.io) provides a public-facing board for feature requests and feedback, which can be linked to GitHub issues. The [Aha! platform](https://www.aha.io) offers idea management features that can integrate with GitHub for roadmap planning.

For more flexibility, building small portals or web applications that sync to GitHub issues can provide a tailored experience for non-technical stakeholders. There are also workflow automation tools like [n8n](https://n8n.io) and [Zapier](https://zapier.com). For more complex workflows, such as those that include human review or approval steps, consider using a tool like [Xebrio](https://xebrio.com) that can integrate with GitHub and provide a more structured requirements management process or a general-purpose workflow system like [Temporalio](https://temporal.io).

While these solutions can help gather anonymous feedback, it's important to note that allowing anonymous contributions may increase the risk of spam or low-quality submissions. Implementing moderation features or requiring email verification can help mitigate these risks while still maintaining a low barrier to entry for community input.

[3]: <https://wpw.bnl.gov/alistairrogers/wp-content/uploads/sites/7/2022/01/crystal-ormelas_et_al_2021.pdf>

[4]: <https://ceur-ws.org/Vol-1525/paper-12.pdf>

[5]: <https://github.com/avinashbest/software-development-process-udacity/blob/master/Requirements_Gathering.md>

[6]: <https://stackoverflow.com/questions/29104/requirements-gathering>

[7]: <https://specinnovations.com/blog/9-methods-to-gather-requirements>

[8]: <https://github.com/topics/requirements-engineering>

[9]: <https://xebrio.com/how-to-integrate-github-with-xebrio/>

## References
