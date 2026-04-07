"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MembersList } from "@/components/members-list";
import { RegistrationForm } from "@/components/registration-form";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRegistrationSuccess = () => {
    setRefreshKey((prev) => prev + 1);
    setModalOpen(false);
  };

  return (
    <div className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Alumni Registration
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground mb-6">
            Join the Nasir Ahmadiyya Old Students Association (NAOSA). Your
            registration will be reviewed and approved by our administrators.
          </p>

          {/* Register Button that opens Modal */}
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <UserPlus className="h-5 w-5" />
                Register as Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  Alumni Registration Form
                </DialogTitle>
                <DialogDescription className="text-base">
                  Fill in your details to register as a NAOSA member. Your
                  registration will be reviewed by an administrator.
                </DialogDescription>
              </DialogHeader>
              <RegistrationForm onSuccess={handleRegistrationSuccess} isModal />
            </DialogContent>
          </Dialog>
        </div>

        {/* Members List */}
        <div className="mt-12">
          <MembersList key={refreshKey} />
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { MembersList } from "@/components/members-list";
// import { RegistrationForm } from "@/components/registration-form";
// import { UserPlus } from "lucide-react";

// export default function RegisterPage() {
//   const [refreshKey, setRefreshKey] = useState(0);
//   const [modalOpen, setModalOpen] = useState(false);

//   const handleRegistrationSuccess = () => {
//     setRefreshKey((prev) => prev + 1);
//     setModalOpen(false);
//   };

//   return (
//     <div className="py-12">
//       <div className="mx-auto max-w-6xl px-4">
//         {/* Page Header */}
//         <div className="mb-8 text-center">
//           <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
//             Alumni Registration
//           </h1>
//           <p className="mx-auto max-w-2xl text-muted-foreground mb-6">
//             Join the Nasir Ahmadiyya Old Students Association (NAOSA). Your
//             registration will be reviewed and approved by our administrators.
//           </p>

//           {/* Register Button that opens Modal */}
//           <Dialog open={modalOpen} onOpenChange={setModalOpen}>
//             <DialogTrigger asChild>
//               <Button size="lg" className="gap-2">
//                 <UserPlus className="h-5 w-5" />
//                 Register as Member
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>Alumni Registration Form</DialogTitle>
//                 <DialogDescription>
//                   Fill in your details to register as a NAOSA member. Your
//                   registration will be reviewed by an administrator.
//                 </DialogDescription>
//               </DialogHeader>
//               <RegistrationForm onSuccess={handleRegistrationSuccess} isModal />
//             </DialogContent>
//           </Dialog>
//         </div>

//         {/* Members List */}
//         <div className="mt-12">
//           <MembersList key={refreshKey} />
//         </div>
//       </div>
//     </div>
//   );
// }
