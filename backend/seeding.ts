import { Subject, Note } from './types'
import { ObjectId } from "mongodb";
import { Subject as SubjectModel } from "./models/subject"
import { Note as NodeModel } from "./models/note"
import { Student, Teacher } from './models/user';
import { StudentType, TeacherType, Grade } from './types';
import { connect } from 'mongoose';
import bcrypt from 'bcrypt';
import { Grade as GradeModel } from './models/grade';


import {grades} from './database/grades'
import {notes} from './database/notes'
import {students} from './database/students'
import {subjects} from './database/subjects'
import {teachers} from './database/teachers'
import {complaints} from './database/complaints'


const mongo_uri = 'mongodb://127.0.0.1:27017/school_proc'
connect(mongo_uri);







const main = async () => {

    const inserted_subjects = await SubjectModel.insertMany(subjects)


    // add subjects to grades

    for (let i = 0; i < 5; i++) {
        grades[i].subjects.push(inserted_subjects[i*4]._id)
        grades[i].subjects.push(inserted_subjects[i*4+1]._id)
        grades[i].subjects.push(inserted_subjects[i*4+2]._id)
        grades[i].subjects.push(inserted_subjects[i*4+3]._id)
    }

    const inserted_grades = await GradeModel.insertMany(grades)

    const teacher_data: TeacherType[] = await teachers()
    console.log(teacher_data.length)
    for (let i = 0; i < 10; i++) {
        teacher_data[i].subjects.push(inserted_subjects[i*2]._id)
        teacher_data[i].subjects.push(inserted_subjects[i*2+1]._id)
    }
    teacher_data[0].isAdmin = true
    teacher_data[0].grades_admin.push(inserted_grades[0]._id)

    teacher_data[1].isAdmin = true
    teacher_data[1].grades_admin.push(inserted_grades[1]._id)

    teacher_data[2].isAdmin = true
    teacher_data[2].grades_admin.push(inserted_grades[2]._id)

    teacher_data[3].isAdmin = true
    teacher_data[3].grades_admin.push(inserted_grades[3]._id)

    teacher_data[4].isAdmin = true
    teacher_data[4].grades_admin.push(inserted_grades[4]._id)


    
    const inserted_teachers = await Teacher.insertMany(teacher_data)




    //@ts-ignore
    const student_data: StudentType[] = await students()

    for (let i = 0; i < student_data.length; i++) {
        student_data[i].grade = inserted_grades[i]._id
    }


    //@ts-ignore
    student_data[0].previous = [
        {
            year: 2022,
            grade: inserted_grades[2]._id
        },
        {
            year: 2021,
            grade: inserted_grades[3]._id
        },
        {
            year: 2020,
            grade: inserted_grades[4]._id
        }
    ]
    const inserted_students = await Student.insertMany(student_data)
    let users_data = []
    for (let i = 0; i < inserted_students.length; i++) {
        users_data.push(inserted_students[i]._id)
    }
    
    for (let i = 0; i < inserted_students.length; i++) {
        const students = await Student.find({_id: { $in: users_data }}).populate({ path: 'grade', model: GradeModel })
		console.log(students)
        let arr = students.map(ele => {
            return ele.grade.subjects
        })
        arr = Array.prototype.concat.apply([], arr);

        const teachers = await Teacher.find({subjects: { $in: arr }}).select("id username email profile_image subjects").populate({ path: 'subjects', model: SubjectModel})
		
        console.log(teachers)

        let notes: Note[] = []
		for (let j = 0; j < students.length; j++) {
			notes.push(
				{
					student: new ObjectId(inserted_students[Math.floor(Math.random() * 5)]._id),
					teacher: new ObjectId(teachers[Math.floor(Math.random() * 5)]._id),
					// @ts-ignore
					subject: new ObjectId(teachers[Math.floor(Math.random() * 5)].subjects[0]._id),
					grade: new ObjectId(inserted_students[j].grade),
					year: 2022,
					notes:{}
				}
			)
		}
		NodeModel.insertMany(notes)
    }
    
    // subjects
    // grades
    // teachers
    // students
    // notes
    // complaints



    //teachers here
    
    //const inserted_subjects = await SubjectModel.insertMany(subjects)
    //for (let i = 0; i < inserted_subjects.length; i++) {
    //    grades[0].subjects.push(inserted_subjects[i].id)
    //    teachers[i].subjects.push(inserted_subjects[i].id)
    //}
    //const inserted_grades = await GradeModel.insertMany(grades)
    //// this is here becuase of the needed await
//
    ////student here
//
    ////for (let i = 0; i < subjects.length; i++) {
    ////    subjects[i].grade = inserted_grades[0]._id
    ////}
    //const inserted_students = await Student.insertMany(students)
//
    //const inserted_teachers = await Teacher.insertMany(teachers)
    //notes[0].student = inserted_students[0].id
    //notes[0].teacher = inserted_teachers[0].id
    //notes[0].subject = inserted_subjects[0].id
    //notes[0].grade = inserted_grades[0].id
    //notes[1].student = inserted_students[0].id
    //notes[1].teacher = inserted_teachers[1].id
    //notes[1].subject = inserted_subjects[1].id
    //notes[1].grade = inserted_grades[0].id
    //notes[2].student = inserted_students[0].id
    //notes[2].teacher = inserted_teachers[2].id
    //notes[2].subject = inserted_subjects[2].id
    //notes[2].grade = inserted_grades[0].id
    //notes[3].student = inserted_students[0].id
    //notes[3].teacher = inserted_teachers[3].id
    //notes[3].subject = inserted_subjects[3].id
    //notes[3].grade = inserted_grades[0].id
    //notes[4].student = inserted_students[0].id
    //notes[4].teacher = inserted_teachers[4].id
    //notes[4].subject = inserted_subjects[4].id
    //notes[4].grade = inserted_grades[0].id
    //await NodeModel.insertMany(notes)




    process.exit(0);
}


main()