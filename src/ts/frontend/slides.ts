interface NewsItem {
    title: string;
    description: string;
    path: string;
    link: string;
}

/**
 * A centralised place to handle the Frontend aspect of the Slideshow.
 */
export class Slides {
    /** Slides. */
    private currentSlide: number | undefined;
    private slides: Array<NewsItem> = [
        {
            title: 'Adventure Awaits',
            description: 'Here at Project Epoch we are working tirelessly to provide you with a whole new experience. Bringing back the old school mystery and adventure we all sorely miss from Classic.<br><br>You will find hundreds of new quests, NPC\'s, rewarding reputations and much much more.<br><br>Explore every nook and cranny like the days of old.',
            path: 'assets/news/zeppelins.jpg',
            link: 'https://www.project-epoch.net/'
        },
        {
            title: 'Soul of Iron',
            description: 'Do you have a Soul of Iron? An indomitable spirit within you that refuses to kneel for your enemies?<br><br>Find the all seeing Chroniclers within every major faction capital and opt in to the challenge to prove your worth on the path to glory.',
            path: 'assets/news/ironforge.jpg',
            link: 'https://www.project-epoch.net/custom-content#:~:text=Beta%201%20successfully.-,Modes,-Warmode%3A%20Within%20faction'
        },
        {
            title: 'Looking For More',
            description: 'Awaiting you at level 60 is a wealth of difficult content to tackle. Onyxia the Broodmother and her two key allies await in her lair.<br><br>Form a group of 25 stalwart heroes to take her down alongside two new bosses and tough new mechanics to claim your epic rewards.',
            path: 'assets/news/onyxia.jpg',
            link: 'https://www.project-epoch.net/custom-content'
        },
    ];

    /** UI Elements. */
    private newsImage: HTMLElement;
    private newsTitle: HTMLElement;
    private newsDescription: HTMLElement;
    private nextSlide: HTMLElement;
    private previousSlide: HTMLElement;
    private newsContainer: HTMLElement;

    constructor() {
        /* set up news ui */
        this.newsImage = document.getElementById('news-image');
        this.newsImage.onclick = () => window.open(this.slides[this.currentSlide].link)
        this.newsTitle = document.getElementById('news-title');
        this.newsDescription = document.getElementById('news-description');
        this.newsContainer = document.getElementById('news-container');
        this.newsContainer.onclick = () => window.open(this.slides[this.currentSlide].link)
        
        /* set up slide nav buttons */
        this.nextSlide = document.getElementById('next-slide');
        this.previousSlide = document.getElementById('previous-slide');
        this.nextSlide.onclick = () => this.setNextSlide();
        this.previousSlide.onclick = () => this.setPreviousSlide();

        this.setNextSlide();

        setInterval(() => {
            this.setNextSlide();
        }, 20000);
    }

    setNextSlide() {
        /** Either loop back and grab the first slide or get the next one. */
        if (this.currentSlide === undefined || this.currentSlide === this.slides.length - 1) {
            this.currentSlide = 0;
        } else {
            this.currentSlide++;
        }

        /** Display it. */
        this.newsImage.setAttribute('src', this.slides[this.currentSlide].path);
        this.newsTitle.innerHTML = this.slides[this.currentSlide].title;
        this.newsDescription.innerHTML = this.slides[this.currentSlide].description;
    }

    setPreviousSlide() {
        /** Either loop back and grab the last slide or get the previous one. */
        if (this.currentSlide === undefined || this.currentSlide === 0) {
            this.currentSlide = this.slides.length - 1;
        } else {
            this.currentSlide--;
        }

        /** Display it. */
        this.newsImage.setAttribute('src', this.slides[this.currentSlide].path);
        this.newsTitle.innerHTML = this.slides[this.currentSlide].title;
        this.newsDescription.innerHTML = this.slides[this.currentSlide].description;
    }
}