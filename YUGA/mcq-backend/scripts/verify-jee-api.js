import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api'; // Adjust port if necessary

async function verifyJEEApi() {
    try {
        console.log('Verifying JEE Syllabus API...');
        const syllabusRes = await axios.get(`${BASE_URL}/curriculum/jee/syllabus`);
        if (syllabusRes.status === 200 && syllabusRes.data.syllabus) {
            console.log('✅ JEE Syllabus API working');
            console.log('Available subjects:', Object.keys(syllabusRes.data.syllabus));
        } else {
            console.error('❌ JEE Syllabus API failed', syllabusRes.data);
        }

        const physicsSyllabus = syllabusRes.data.syllabus.Physics;
        if (physicsSyllabus) {
            const class11 = physicsSyllabus['Class 11'];
            if (class11 && class11.length > 0) {
                const firstChapter = class11[0];
                console.log(`Verifying JEE Topics API for ${firstChapter.name} (Class 11)...`);
                const topicsRes = await axios.get(`${BASE_URL}/curriculum/jee/topics`, {
                    params: {
                        subject: 'JEE Physics Class',
                        classLevel: 'Class 11',
                        chapter: firstChapter.name,
                        type: 'jee'
                    }
                });

                if (topicsRes.status === 200 && topicsRes.data.topics) {
                    console.log('✅ JEE Topics API working');
                    console.log('Sample topics:', topicsRes.data.topics.slice(0, 3).map(t => typeof t === 'string' ? t : t.title));
                } else {
                    console.error('❌ JEE Topics API failed', topicsRes.data);
                }
            }
        }

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

verifyJEEApi();
