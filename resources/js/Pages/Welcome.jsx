import Card from "@/Components/Card";
import Modal from "@/Components/Modal";
import PageLayout from "@/Layouts/PageLayout";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Welcome({ data }) {
    const { flash } = usePage().props;
    const [status, setStatus] = useState(flash.status || []);
    const [isModal, setModal] = useState(false);
    const [selectedItem, setItem] = useState(false);
    const handleSelect = (itemData) => {
        setModal(true);
        setItem(itemData);
    };

    useEffect(() => {
        setStatus(flash.status);
    }, [flash.status]);

    useEffect(() => {
        if (status) {
            const timer = setTimeout(() => {
                setStatus([]);
            }, 1000);
            flash.status = "";
            return () => clearTimeout(timer);
        }
    }, [status]);

    return (
        <PageLayout>
            <div className="">
                <a href="/dashboard/daily">Daily</a>
            </div>
            <div>
                <a href="/dashboard/request">Request</a>
            </div>
        </PageLayout>
    );
}