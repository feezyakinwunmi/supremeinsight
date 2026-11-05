-- =====================================================================
-- SupremeInsight: two sample long-form posts
-- Paste into Supabase > SQL Editor > New query > Run.
--
-- Uses every block type the editor supports:
--   heading (h2 + h3), paragraph (with **bold** and links), image (normal / wide / full),
--   list (bullet, number, check, dash, icon, cards, 1 + 2 columns), quote,
--   callout (info, warning, success, highlight), video, stats, button,
--   divider (line, dots, space)
--
-- * The author is your first admin account (create it first by signing in).
-- * Post 1 is marked "featured", so it shows in the homepage hero.
-- * Images point to the photos in /public/images.
-- * Safe to run twice: posts that already exist (same slug) are skipped.
-- * To remove them later:
--     delete from public.posts where slug in (
--       'faith-at-work-seven-principles-kingdom-minded-business',
--       'stewardship-in-a-digital-economy-building-lasting-family-wealth');
-- =====================================================================

-- ---------------------------------------------------------------------
-- POST 1: Editorial template, Business & Enterprise, featured
-- ---------------------------------------------------------------------
insert into public.posts (
  slug, title, excerpt, cover_image, department_id, template, blocks, tags,
  status, featured, reading_minutes, author_id, seo_title, seo_description, published_at
)
values (
  'faith-at-work-seven-principles-kingdom-minded-business',
  'Faith at Work: Seven Principles for Building a Kingdom-Minded Business',
  'Profit and purpose are not enemies. Here is how Christian founders and leaders are building companies that serve customers well, treat people with dignity and still grow.',
  '/images/workplace.jpg',
  (select id from public.departments where slug = 'business-enterprise'),
  'editorial',
  $json$[
    {"id":"p1b01","type":"paragraph","text":"For many believers, Monday morning feels like a different world from Sunday morning. On Sunday we talk about calling, service and grace. On Monday we talk about margins, deadlines and targets. Yet a growing number of Christian founders and executives are discovering that the two worlds were never meant to be separate. **The workplace is not a distraction from faith. It is one of the main places where faith is lived out.**"},
    {"id":"p1b02","type":"paragraph","text":"We spoke with business owners, managers and ministry leaders across several industries to understand what a kingdom-minded business actually looks like in practice. What follows are seven principles that came up again and again, along with practical steps you can take this week."},
    {"id":"p1b03","type":"stats","items":[
      {"id":"p1s1","value":"7","label":"Core principles"},
      {"id":"p1s2","value":"5","label":"Practical steps to start"},
      {"id":"p1s3","value":"1","label":"Calling that connects them"}
    ]},
    {"id":"p1b04","type":"heading","level":2,"text":"Why faith belongs in the boardroom"},
    {"id":"p1b05","type":"paragraph","text":"Work was part of God's design before anything went wrong in the world. In Genesis, people are placed in a garden to tend it and keep it. That means building, organising, creating and serving others are not secular activities to be tolerated. They are part of what it means to be human, and part of how we honour God."},
    {"id":"p1b06","type":"quote","text":"And whatsoever ye do, do it heartily, as to the Lord, and not unto men.","cite":"Colossians 3:23"},
    {"id":"p1b07","type":"paragraph","text":"When leaders take that seriously, it changes how they hire, how they price, how they handle conflict and how they measure success. It does not make business easier, but it does make it more meaningful."},
    {"id":"p1b08","type":"image","url":"/images/team.jpg","alt":"A small team laughing together around a table with laptops","caption":"Healthy teams are built on trust, honesty and shared purpose.","width":"wide"},
    {"id":"p1b09","type":"heading","level":2,"text":"The seven principles"},
    {"id":"p1b10","type":"list","style":"number","icon":"","columns":1,"items":[
      {"id":"p1l1","text":"**Purpose before profit.** Know why your business exists beyond making money, and let that purpose shape your decisions."},
      {"id":"p1l2","text":"**Integrity in every transaction.** Honest pricing, honest marketing and honest reporting, even when no one is checking."},
      {"id":"p1l3","text":"**People are not resources.** Employees, suppliers and customers carry God's image. Treat them that way."},
      {"id":"p1l4","text":"**Excellence as worship.** Doing great work is a way of honouring God and serving your neighbour."},
      {"id":"p1l5","text":"**Generosity built into the model.** Plan to give, not just when there is something left over."},
      {"id":"p1l6","text":"**Rest as a discipline.** Sustainable rhythms protect your team and your own soul."},
      {"id":"p1l7","text":"**Long-term stewardship.** Build something that will outlast you and bless the next generation."}
    ]},
    {"id":"p1b11","type":"heading","level":3,"text":"1. Purpose before profit"},
    {"id":"p1b12","type":"paragraph","text":"Profit matters. A business that does not make money cannot pay its people, serve its customers or give generously. But profit works best as a result of serving people well, not as the only goal. Leaders we spoke with described writing a simple purpose statement and then using it as a filter: **does this decision move us toward the reason we exist?**"},
    {"id":"p1b13","type":"callout","tone":"info","icon":"Lightbulb","title":"Try this","text":"Write your company's purpose in one sentence that a new employee could remember. Then ask your team where your current priorities do and do not match it."},
    {"id":"p1b14","type":"heading","level":3,"text":"2. Integrity in every transaction"},
    {"id":"p1b15","type":"paragraph","text":"Integrity is rarely tested in big, dramatic moments. It is tested in small ones: a slightly exaggerated claim in an advert, an invoice that is quietly rounded up, a delay that is blamed on someone else. Over time, these small choices become the culture of a company."},
    {"id":"p1b16","type":"callout","tone":"warning","icon":"AlertTriangle","title":"Watch out for quiet compromises","text":"Pressure to hit a target is one of the most common reasons good people cut corners. Make it safe for your team to report bad news early."},
    {"id":"p1b17","type":"heading","level":3,"text":"3. People are not resources"},
    {"id":"p1b18","type":"paragraph","text":"The phrase human resources is useful on an organisation chart, but dangerous in the heart. Kingdom-minded leaders work hard to see the person behind the role. That shows up in fair pay, clear expectations, honest feedback and real care when life gets hard."},
    {"id":"p1b19","type":"list","style":"check","icon":"","columns":2,"items":[
      {"id":"p1c1","text":"Pay fairly and on time"},
      {"id":"p1c2","text":"Give clear, kind feedback"},
      {"id":"p1c3","text":"Celebrate wins publicly"},
      {"id":"p1c4","text":"Correct mistakes privately"},
      {"id":"p1c5","text":"Invest in training and growth"},
      {"id":"p1c6","text":"Make room for family and faith"}
    ]},
    {"id":"p1b20","type":"heading","level":3,"text":"4. Excellence as worship"},
    {"id":"p1b21","type":"paragraph","text":"Sloppy work is not more spiritual. In fact, poor quality often hurts the very people we say we want to serve. Excellence does not mean perfectionism. It means caring enough about your customers to keep improving."},
    {"id":"p1b22","type":"divider","style":"dots"},
    {"id":"p1b23","type":"heading","level":3,"text":"5. Generosity built into the model"},
    {"id":"p1b24","type":"paragraph","text":"Several founders told us they decided how much to give before they knew how much they would earn. Some give a fixed share of profit. Others support local churches, charities or employee hardship funds. The common thread is intention: generosity is planned, not accidental."},
    {"id":"p1b25","type":"list","style":"icon","icon":"Heart","columns":1,"items":[
      {"id":"p1i1","text":"**Profit sharing** with employees in good years","icon":"Coins"},
      {"id":"p1i2","text":"**Community partnerships** with local churches and charities","icon":"Church"},
      {"id":"p1i3","text":"**Pro bono work** for ministries that cannot afford your services","icon":"Handshake"},
      {"id":"p1i4","text":"**Mentoring** young entrepreneurs in your community","icon":"GraduationCap"}
    ]},
    {"id":"p1b26","type":"heading","level":3,"text":"6. Rest as a discipline"},
    {"id":"p1b27","type":"paragraph","text":"Burnout is often treated as a badge of honour in business culture. Scripture offers a different rhythm. Sabbath reminds us that the world does not depend on our constant effort. Leaders who model healthy rest give their teams permission to do the same, and they usually make better decisions too."},
    {"id":"p1b28","type":"heading","level":3,"text":"7. Long-term stewardship"},
    {"id":"p1b29","type":"paragraph","text":"Finally, a kingdom-minded business thinks in decades, not quarters. That affects how you treat the environment, how you plan succession, and how you train the next generation of leaders."},
    {"id":"p1b30","type":"video","url":"https://www.youtube.com/watch?v=u4ZoJKF_VuA","caption":"Simon Sinek on why purpose drives great organisations (TEDx Puget Sound)"},
    {"id":"p1b31","type":"heading","level":2,"text":"Five steps you can take this week"},
    {"id":"p1b32","type":"list","style":"cards","icon":"","columns":2,"items":[
      {"id":"p1k1","title":"Write your purpose","text":"One clear sentence about why your business exists beyond profit.","icon":"Target"},
      {"id":"p1k2","title":"Review one process","text":"Pick a sales, billing or hiring process and check it for honesty and fairness.","icon":"Search"},
      {"id":"p1k3","title":"Thank your team","text":"Recognise someone specific for work that reflects your values.","icon":"ThumbsUp"},
      {"id":"p1k4","title":"Set a giving goal","text":"Decide what share of this year's profit you will give away.","icon":"Gift"},
      {"id":"p1k5","title":"Schedule real rest","text":"Block out time off and protect it like a client meeting.","icon":"Sun"},
      {"id":"p1k6","title":"Find a peer group","text":"Meet regularly with other believers in business for honest accountability.","icon":"Users"}
    ]},
    {"id":"p1b33","type":"callout","tone":"success","icon":"CheckCircle2","title":"The bottom line","text":"A kingdom-minded business is not a business with a Bible verse on the wall. It is a business where faith shapes the everyday decisions that customers, employees and suppliers actually feel."},
    {"id":"p1b34","type":"divider","style":"line"},
    {"id":"p1b35","type":"paragraph","text":"Are you building a business with these values? We would love to hear your story and may feature it in a future issue."},
    {"id":"p1b36","type":"button","label":"Share your story with us","url":"/contact","align":"center"},
    {"id":"p1b37","type":"divider","style":"space"}
  ]$json$::jsonb,
  array['leadership','entrepreneurship','faith at work','business ethics'],
  'published',
  true,
  5,
  (select id from public.profiles where role = 'admin' order by created_at limit 1),
  'Faith at Work: 7 Principles for a Kingdom-Minded Business',
  'Seven practical principles for Christian founders and leaders who want to build businesses that serve people well and still grow.',
  now() - interval '1 day'
)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- POST 2: Magazine template, Finance & Wealth
-- ---------------------------------------------------------------------
insert into public.posts (
  slug, title, excerpt, cover_image, department_id, template, blocks, tags,
  status, featured, reading_minutes, author_id, seo_title, seo_description, published_at
)
values (
  'stewardship-in-a-digital-economy-building-lasting-family-wealth',
  'Stewardship in a Digital Economy: How Christian Families Can Build Lasting Wealth',
  'Mobile banking, online investing and digital payments have changed how money moves. The principles of wise stewardship have not. A practical guide for families who want to give, save and grow with purpose.',
  '/images/bible.jpg',
  (select id from public.departments where slug = 'finance-wealth'),
  'magazine',
  $json$[
    {"id":"p2b01","type":"paragraph","text":"Money has never moved faster. A salary can arrive, be split into savings, pay a bill and fund a donation in a few taps. Investing apps put markets in everyone's pocket. Yet many families feel more stretched and less secure than ever. **Technology has made money easier to move, but not easier to manage.**"},
    {"id":"p2b02","type":"paragraph","text":"Biblical stewardship starts from a simple idea: everything we have belongs to God, and we are managers, not owners. That idea is just as powerful in a digital economy as it was in an agricultural one. This guide shows how to put it into practice with today's tools."},
    {"id":"p2b03","type":"image","url":"/images/bible.jpg","alt":"An open Bible held in someone's hands","caption":"Wise stewardship starts with the right foundation.","width":"full"},
    {"id":"p2b04","type":"heading","level":2,"text":"The stewardship mindset"},
    {"id":"p2b05","type":"quote","text":"The thoughts of the diligent tend only to plenteousness; but of every one that is hasty only to want.","cite":"Proverbs 21:5"},
    {"id":"p2b06","type":"paragraph","text":"Diligence and patience are the quiet engines of lasting wealth. Get-rich-quick schemes, whether they arrive as a dubious investment tip or a flashy online course, usually promise the opposite. Families who build lasting wealth tend to do ordinary things consistently for a long time."},
    {"id":"p2b07","type":"stats","items":[
      {"id":"p2s1","value":"10%","label":"A common starting point for giving"},
      {"id":"p2s2","value":"3–6","label":"Months of expenses for an emergency fund"},
      {"id":"p2s3","value":"20+","label":"Years: the horizon for long-term investing"}
    ]},
    {"id":"p2b08","type":"heading","level":2,"text":"Give first, save second, spend last"},
    {"id":"p2b09","type":"paragraph","text":"Most budgets work in the opposite order: we spend, then save whatever is left, then give from whatever remains. Reversing the order changes everything. When giving and saving are automatic, spending naturally adjusts to what is actually available."},
    {"id":"p2b10","type":"list","style":"cards","icon":"","columns":2,"items":[
      {"id":"p2k1","title":"Give","text":"Set up an automatic transfer to your church or chosen charities on payday.","icon":"Heart"},
      {"id":"p2k2","title":"Save","text":"Move a fixed amount into a separate savings account before you see it.","icon":"Wallet"},
      {"id":"p2k3","title":"Invest","text":"Contribute regularly to long-term investments or a pension plan.","icon":"TrendingUp"},
      {"id":"p2k4","title":"Spend","text":"Live on what remains, using a simple budget to stay on track.","icon":"Coins"}
    ]},
    {"id":"p2b11","type":"callout","tone":"highlight","icon":"Sparkles","title":"Automate your values","text":"Most banking apps let you schedule transfers. Ten minutes of setup can turn good intentions into a habit that runs every month."},
    {"id":"p2b12","type":"heading","level":2,"text":"Building your safety net"},
    {"id":"p2b13","type":"paragraph","text":"An emergency fund is one of the most practical acts of faith a family can make. It turns a broken car or an unexpected bill from a crisis into an inconvenience, and it frees you to be generous when others are in need."},
    {"id":"p2b14","type":"list","style":"bullet","icon":"","columns":1,"items":[
      {"id":"p2u1","text":"Start with a small, reachable goal, such as one month of essential expenses."},
      {"id":"p2u2","text":"Keep it in a separate account so it is not mixed with everyday spending."},
      {"id":"p2u3","text":"Only use it for true emergencies, then refill it as soon as you can."},
      {"id":"p2u4","text":"Grow it toward three to six months of expenses over time."}
    ]},
    {"id":"p2b15","type":"divider","style":"line"},
    {"id":"p2b16","type":"heading","level":2,"text":"Investing wisely in a noisy world"},
    {"id":"p2b17","type":"paragraph","text":"Online platforms have made investing accessible to almost everyone, which is a great opportunity. They have also made it easy to chase trends, trade too often and take risks that are not understood. Wise investing is usually boring: diversified, long-term and aligned with your values."},
    {"id":"p2b18","type":"heading","level":3,"text":"Questions to ask before you invest"},
    {"id":"p2b19","type":"list","style":"dash","icon":"","columns":1,"items":[
      {"id":"p2d1","text":"Do I understand exactly how this investment makes money?"},
      {"id":"p2d2","text":"Can I leave this money untouched for at least five years?"},
      {"id":"p2d3","text":"Is this spread across many companies or concentrated in a few?"},
      {"id":"p2d4","text":"Do the businesses involved reflect values I am comfortable supporting?"},
      {"id":"p2d5","text":"What fees will I pay, and how will they affect my returns over time?"}
    ]},
    {"id":"p2b20","type":"callout","tone":"warning","icon":"Shield","title":"Protect yourself from scams","text":"Be cautious of anyone promising guaranteed high returns, pressuring you to act quickly, or asking for payment in cryptocurrency or gift cards. When in doubt, pause and talk to someone you trust."},
    {"id":"p2b21","type":"heading","level":2,"text":"Teaching the next generation"},
    {"id":"p2b22","type":"paragraph","text":"Lasting family wealth is as much about character as it is about capital. Children who learn to give, save and spend wisely carry those habits into adulthood. Digital money can make this harder, because coins and notes are no longer visible, so parents need to be intentional."},
    {"id":"p2b23","type":"image","url":"/images/team.jpg","alt":"Young adults talking together around a table","caption":"Conversations about money build habits that last a lifetime.","width":"normal"},
    {"id":"p2b24","type":"list","style":"icon","icon":"Star","columns":2,"items":[
      {"id":"p2i1","text":"Give children a small allowance split into give, save and spend","icon":"PieChart"},
      {"id":"p2i2","text":"Let teenagers manage a prepaid card with a monthly budget","icon":"Wallet"},
      {"id":"p2i3","text":"Talk openly about why your family gives","icon":"MessageCircle"},
      {"id":"p2i4","text":"Show them how compound growth works with a simple example","icon":"BarChart3"},
      {"id":"p2i5","text":"Involve them in choosing a cause to support","icon":"Gift"},
      {"id":"p2i6","text":"Celebrate savings milestones together","icon":"Trophy"}
    ]},
    {"id":"p2b25","type":"heading","level":2,"text":"Your stewardship checklist"},
    {"id":"p2b26","type":"list","style":"check","icon":"","columns":1,"items":[
      {"id":"p2c1","text":"Write down your family's giving, saving and spending priorities"},
      {"id":"p2c2","text":"Set up automatic transfers for giving and saving"},
      {"id":"p2c3","text":"Start or grow your emergency fund"},
      {"id":"p2c4","text":"Review your debts and make a plan to pay them down"},
      {"id":"p2c5","text":"Check your investments for fees, risk and values"},
      {"id":"p2c6","text":"Schedule a monthly money conversation as a family"}
    ]},
    {"id":"p2b27","type":"callout","tone":"info","icon":"Info","title":"A note on advice","text":"This article offers general principles, not personal financial advice. For decisions about investments, pensions or debt, speak with a qualified financial adviser who understands your situation."},
    {"id":"p2b28","type":"quote","text":"Stewardship is not about how much we have. It is about what we do with what we have been given.","cite":"SupremeInsight editorial team"},
    {"id":"p2b29","type":"divider","style":"dots"},
    {"id":"p2b30","type":"paragraph","text":"Want more practical guides like this one? Subscribe and choose **Finance & Wealth** to get an email whenever we publish a new story on money, stewardship and generosity."},
    {"id":"p2b31","type":"button","label":"Subscribe to the newsletter","url":"/newsletter","align":"left"},
    {"id":"p2b32","type":"divider","style":"space"}
  ]$json$::jsonb,
  array['stewardship','personal finance','giving','family'],
  'published',
  false,
  4,
  (select id from public.profiles where role = 'admin' order by created_at limit 1),
  'Stewardship in a Digital Economy: Building Lasting Family Wealth',
  'A practical guide for Christian families who want to give, save and invest wisely using today''s digital tools.',
  now() - interval '3 hours'
)
on conflict (slug) do nothing;

-- Check the result
select slug, status, featured, template, jsonb_array_length(blocks) as blocks, published_at
from public.posts
where slug in (
  'faith-at-work-seven-principles-kingdom-minded-business',
  'stewardship-in-a-digital-economy-building-lasting-family-wealth'
);
