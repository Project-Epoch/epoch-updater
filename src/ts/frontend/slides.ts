interface NewsItem {
    path: string;
}

/**
 * A centralised place to handle the Frontend aspect of the Slideshow.
 */
export class Slides {
    /** Slides. */
    private currentSlide: number | undefined;
    private slides: Array<NewsItem> = [
        {
            path: 'https://www.project-epoch.net/img/raids/onyxias-lair/1.jpg',
        },
        {
            path: 'https://www.project-epoch.net/img/dungeons/baradin/6.jpg',
        },
        {
            path: 'https://www.project-epoch.net/img/raids/molten-core/1.jpg',
        },
        {
            path: 'https://www.project-epoch.net/img/dungeons/deadmines/4.jpg',
        },
        {
            path: 'https://www.project-epoch.net/img/dungeons/glitter/1.jpg',
        },
        {
            path: 'https://www.project-epoch.net/img/dungeons/wailing/4.jpg',
        },
        {
            path: 'https://www.project-epoch.net/img/dungeons/glitter/1.jpg',
        },
        {
            path: 'https://www.project-epoch.net/img/locations/ashfallpost/1.jpg',
        },
        {
            path: 'https://www.project-epoch.net/img/locations/tolbaradisland/4.jpg',
        },
        {
            path: 'https://www.project-epoch.net/img/locations/valormok/1.jpg',
        },
        {
            path: 'https://www.project-epoch.net/img/locations/telesaran/4.jpg',
        },
        {
            path: 'https://www.project-epoch.net/img/locations/silithus/4.jpg',
        },
    ];

    /** UI Elements. */
    private newsImage: HTMLElement;
    private newsTitle: HTMLElement;
    private newsDescription: HTMLElement;

    constructor() {
        this.newsImage = document.getElementById('news-image');

        this.setNextSlide();

        setInterval(() => {
            this.setNextSlide();
        }, 20000);
    }

    setNextSlide() {
        /** Either loop back and grab the first slide or get the next one. */
        if (this.currentSlide === undefined || this.currentSlide === this.slides.length - 1) {
            this.currentSlide = 0;
        }
        else {
            this.currentSlide++;
        }

        /** Display it. */
        this.newsImage.setAttribute('src', this.slides[this.currentSlide].path);
    }
}