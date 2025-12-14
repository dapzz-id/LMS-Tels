<?php

namespace Database\Seeders;

use App\Models\Kuis;
use App\Models\Kursus;
use App\Models\Mapel;
use App\Models\SoalKuis;
use App\Models\SubPembahasan;
use Illuminate\Database\Seeder;

class WebDevCourseSeeder extends Seeder
{
    public function run()
    {
        // Create Web Development Department
        $mapel = Mapel::create([
            'nama_mapel' => 'Web Development',
            'deskripsi' => 'Learn modern web development technologies and practices'
        ]);

        // Create Course
        $course = Kursus::create([
            'id_mapel' => $mapel->id,
            'judul_kursus' => 'Introduction to Web Development',
            'deskripsi_kursus' => 'Learn the fundamentals of web development, including HTML, CSS, and basic JavaScript',
            'url_thumbnail' => 'https://img.youtube.com/vi/UB1O30fR-EE/maxresdefault.jpg',
            'status' => 'published',
            // 'difficulty_level' => 1,
            'prerequisites' => ['Basic computer skills', 'Internet access'],
            'learning_objectives' => [
                'Understand HTML structure and elements',
                'Learn CSS styling and layout',
                'Master basic JavaScript concepts'
            ],
            'target_audience' => ['Beginners', 'Students', 'Career changers'],
            'is_featured' => true
        ]);

        // Create HTML Section Quiz
        $htmlQuiz = Kuis::create([
            'judul_kuis' => 'HTML Fundamentals Quiz',
            'deskripsi_kuis' => 'Test your knowledge of HTML basics'
        ]);

        // Add HTML Quiz Questions
        SoalKuis::create([
            'id_kuis' => $htmlQuiz->id,
            'pertanyaan' => 'What does HTML stand for?',
            'pilihan_jawaban' => json_encode([
                'Hyper Text Markup Language',
                'High Tech Modern Language',
                'Hyper Transfer Markup Language',
                'Home Tool Markup Language'
            ]),
            'jawaban_benar' => 0
        ]);

        SoalKuis::create([
            'id_kuis' => $htmlQuiz->id,
            'pertanyaan' => 'Which tag is used to create a paragraph in HTML?',
            'pilihan_jawaban' => json_encode([
                '<paragraph>',
                '<p>',
                '<para>',
                '<text>'
            ]),
            'jawaban_benar' => 1
        ]);

        // Create HTML Section
        SubPembahasan::create([
            'id_kursus' => $course->id,
            'title' => 'HTML Fundamentals',
            'description' => 'Learn the basics of HTML structure and elements',
            'video_title' => 'Introduction to HTML',
            'video_description' => 'Understanding HTML basics and document structure',
            'url_video_sub_pembahasan' => 'https://www.youtube.com/watch?v=UB1O30fR-EE',
            'pdf_title' => 'HTML Cheat Sheet',
            'pdf_description' => 'Quick reference guide for HTML elements and attributes',
            'url_materi_pdf_sub_pembahasan' => '/storage/pdfs/html-cheatsheet.pdf',
            'quiz_title' => 'HTML Knowledge Check',
            'quiz_description' => 'Test your understanding of HTML fundamentals',
            'id_kuis' => $htmlQuiz->id,
            'order' => 1
        ]);

        // Create CSS Section Quiz
        $cssQuiz = Kuis::create([
            'judul_kuis' => 'CSS Fundamentals Quiz',
            'deskripsi_kuis' => 'Test your knowledge of CSS basics'
        ]);

        // Add CSS Quiz Questions
        SoalKuis::create([
            'id_kuis' => $cssQuiz->id,
            'pertanyaan' => 'What does CSS stand for?',
            'pilihan_jawaban' => json_encode([
                'Creative Style Sheets',
                'Computer Style Sheets',
                'Cascading Style Sheets',
                'Colorful Style Sheets'
            ]),
            'jawaban_benar' => 2
        ]);

        SoalKuis::create([
            'id_kuis' => $cssQuiz->id,
            'pertanyaan' => 'Which property is used to change the background color?',
            'pilihan_jawaban' => json_encode([
                'color',
                'bgcolor',
                'background-color',
                'background'
            ]),
            'jawaban_benar' => 2
        ]);

        // Create CSS Section
        SubPembahasan::create([
            'id_kursus' => $course->id,
            'title' => 'CSS Styling',
            'description' => 'Learn how to style your web pages with CSS',
            'video_title' => 'Introduction to CSS',
            'video_description' => 'Understanding CSS selectors and properties',
            'url_video_sub_pembahasan' => 'https://www.youtube.com/watch?v=1PnVor36_40',
            'pdf_title' => 'CSS Cheat Sheet',
            'pdf_description' => 'Quick reference guide for CSS properties and values',
            'url_materi_pdf_sub_pembahasan' => '/storage/pdfs/css-cheatsheet.pdf',
            'quiz_title' => 'CSS Knowledge Check',
            'quiz_description' => 'Test your understanding of CSS fundamentals',
            'id_kuis' => $cssQuiz->id,
            'order' => 2
        ]);

        // Create JavaScript Section Quiz
        $jsQuiz = Kuis::create([
            'judul_kuis' => 'JavaScript Basics Quiz',
            'deskripsi_kuis' => 'Test your knowledge of JavaScript fundamentals'
        ]);

        // Add JavaScript Quiz Questions
        SoalKuis::create([
            'id_kuis' => $jsQuiz->id,
            'pertanyaan' => 'Which keyword is used to declare a variable in JavaScript?',
            'pilihan_jawaban' => json_encode([
                'var',
                'let',
                'const',
                'All of the above'
            ]),
            'jawaban_benar' => 3
        ]);

        SoalKuis::create([
            'id_kuis' => $jsQuiz->id,
            'pertanyaan' => 'What is the correct way to write a JavaScript array?',
            'pilihan_jawaban' => json_encode([
                'var colors = "red", "green", "blue"',
                'var colors = ["red", "green", "blue"]',
                'var colors = (1:"red", 2:"green", 3:"blue")',
                'var colors = 1 = ("red"), 2 = ("green"), 3 = ("blue")'
            ]),
            'jawaban_benar' => 1
        ]);

        // Create JavaScript Section
        SubPembahasan::create([
            'id_kursus' => $course->id,
            'title' => 'JavaScript Basics',
            'description' => 'Learn the fundamentals of JavaScript programming',
            'video_title' => 'Introduction to JavaScript',
            'video_description' => 'Understanding JavaScript basics and syntax',
            'url_video_sub_pembahasan' => 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
            'pdf_title' => 'JavaScript Cheat Sheet',
            'pdf_description' => 'Quick reference guide for JavaScript fundamentals',
            'url_materi_pdf_sub_pembahasan' => '/storage/pdfs/javascript-cheatsheet.pdf',
            'quiz_title' => 'JavaScript Knowledge Check',
            'quiz_description' => 'Test your understanding of JavaScript basics',
            'id_kuis' => $jsQuiz->id,
            'order' => 3
        ]);
    }
}
