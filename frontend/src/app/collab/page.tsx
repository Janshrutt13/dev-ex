import { Navbar } from "@/components/navbar";
import { CollabPost } from "@/components/collab-post";

interface User {
    _id : string;
    username : string;
    profileImageUrl? : string;
}

interface CollabProject {
    _id : string;
    author : User;
    title : string;
    description : string;
    requiredSkills : string[];
    collaborators : User[];
    status : 'OPEN' | 'CLOSED';
}

//Func to fetch collab projects
async function getCollabProject() : Promise<CollabProject[]> {
    try{
        const res = await fetch(`http://localhost:5000/api/collabs` , {cache : 'no-store'});
        if(!res.ok){
            return []
        }
        return res.json();
    }catch(err){
        console.error(err);
        return []
    }
}

export default async function CollabPage(){
    const projects = await getCollabProject();

    return (
        <div className="min-h-screen bg-background">
          <Navbar/>
          <main className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
               <h1 className="text-4xl font-bold tracking-tight">
                Find a Project
               </h1>
               <p className="text-muted-foreground mt-2">
                Join forces with other developers and build something amazing together.
            </p>
            </div>
            {projects.length > 0 ?(
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {
                    projects.map((project) => (
                        <CollabPost key={project._id} project={project}/>
                    ))}
                </div>
            ):(
                <div className="text-center text-muted-foreground py-16"> 
                    <p>No open collaborations projects, Why not start one?</p>
                </div>
            )}
          </main>
        </div>
    );
}